import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import type { IGerenciadorPlanejamentoMutation } from "../interfaces/IGerenciadorPlanejamento";
import { Planejamento } from "./Planejamento.entity";
import { PlanejamentoDiario } from "./PlanejamentoDiario.entity";
import { Inject } from "@nestjs/common";
import { PlanejamentoDiarioRepository } from "../../infra/repositories/PlanejamentoDiario.repo";
import { Between, In, Repository } from "typeorm";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Item } from "./Item.entity";
import { PlanejamentoRepository } from "../../infra/repositories/Planejamento.repo";
import { Pedido } from "./Pedido.entity";
import { IGerenciadorPlanejamentConsulta } from "../interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";

export class GerenciadorPlanejamento implements IGerenciadorPlanejamentoMutation, IGerenciadorPlanejamentConsulta {
    private planejamentos: Array<PlanejamentoDiario> = []
    private calendario: Calendario = new Calendario();
    private divida: Planejamento[] = [];

    constructor(
        @Inject(PlanejamentoRepository) private planejamentoRepo: Repository<Planejamento>,
        @Inject(PlanejamentoDiarioRepository) private planejamentoDiarioRepo: Repository<PlanejamentoDiario>
    ) { }

    async appendPlanejamento(planejamentosTemp: PlanejamentoTemporario[]): Promise<PlanejamentoDiario[]> {
        return this.planejamentoDiarioRepo.manager.transaction(async (manager) => {
            const resultados: PlanejamentoDiario[] = [];

            for (const temp of planejamentosTemp) {
                try {
                    const podeAlocar = await this.possoAlocarNoDia(temp.dia, temp.setor, temp.item, temp.qtd);
                    if (!podeAlocar) {
                        throw new Error(`Tentativa de alocar carga excedente no dia ${temp.dia.toISOString()}`);
                    }

                    let planejamentoDiario = await this.planejamentoDoDia(temp.dia);

                    const novoPlanejamento = manager.create(this.planejamentoRepo.target, {
                        item: temp.item,
                        pedido: temp.pedido,
                        qtd: temp.qtd,
                        setor: temp.setor
                    });

                    if (planejamentoDiario) {
                        const existente = planejamentoDiario.planejamentos.find(
                            plan => plan.pedido.id === temp.pedido.id && plan.setor === temp.setor
                        );

                        if (existente) {
                            existente.qtd += temp.qtd;
                        } else {
                            planejamentoDiario.planejamentos.push(novoPlanejamento);
                        }
                    } else {
                        planejamentoDiario = manager.create(this.planejamentoDiarioRepo.target, {
                            dia: temp.dia,
                            planejamentos: [novoPlanejamento]
                        });
                    }

                    const atualizado = await manager.save(planejamentoDiario);
                    resultados.push(atualizado);
                } catch (error) {
                    console.error(error);
                    throw new Error(`Problemas ao adicionar item ${temp.item.codigo} no planejamento: ${error.message}`);
                }
            }
            return resultados;
        });
    }

    addDivida(...divida: Planejamento[]): void {
        this.divida.push(...divida);
    }

    //jogar para uma tabela para começar usar o repository
    getPlanejamentos(): Array<PlanejamentoDiario> {
        return [...this.planejamentos];
    }

    async diaComFolgaNaProducao(pointerDate: Date, planejamento: Planejamento): Promise<Date[]> {
        const proximosPlanejamentos = await this.planejamentoDiarioRepo
            .createQueryBuilder("pd")
            .innerJoinAndSelect("pd.planejamentos", "plano")
            .innerJoinAndSelect("plano.setor", "setor")
            .where("pd.dia > :pointerDate", { pointerDate })
            .andWhere("setor.operacao = :operacao", { operacao: planejamento.setor })
            .orderBy("pd.dia", "ASC")
            .getMany();

        const diasComCapacidade = proximosPlanejamentos.filter(dia =>
            dia.planejamentos.filter(i => i.item.getCodigo() === planejamento.item.getCodigo())
                .reduce((total, plan) => total += plan.qtd, 0) < planejamento.item.produzaPc(planejamento.setor)
        ).map(d => d.dia);

        if (!diasComCapacidade.length) throw new Error('Nao foi achado dia com furo na producao');
        return diasComCapacidade;
    }

    /**
     * 
     * @param dataPonteiro 
     * @param setor 
     * @param item 
     * @returns 
     * @description ira voltar um lista de dias que a produção tem espaço, independente do da quantidade que for
     */
    async diaParaAdiantarProducaoEncaixe(
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        planejamentosTemporarios: PlanejamentoTemporario[] = []
    ): Promise<Date[]> {
        const retries = 100;
        let quantoPreciso = qtd;
        const findDates: Array<Date> = [];
        let diaAlvo = this.calendario.ultimoDiaUtil(dataPonteiro, true);
        const diasUsados = new Set<number>();

        for (let i = 0; i < retries && quantoPreciso > 0; i++) {
            // Evita repetir o mesmo dia
            if (diasUsados.has(diaAlvo.getTime())) {
                diaAlvo = this.calendario.diasPossiveis(this.calendario.subDays(diaAlvo, 1), 1)[0];
                continue;
            }
            diasUsados.add(diaAlvo.getTime());

            const capacidadePersistida = await this.possoAlocarQuantoNoDia(diaAlvo, setor, item, planejamentosTemporarios);
            if (capacidadePersistida > 0) {
                findDates.push(diaAlvo);
                quantoPreciso -= capacidadePersistida;
            }
            diaAlvo = this.calendario.diasPossiveis(this.calendario.subDays(diaAlvo, 1), 1)[0];
        }
        if (quantoPreciso > 0) {
            throw new Error('Não foi possível encontrar dias suficientes para adiantar a produção.');
        }
        return findDates;
    }

    async diaParaAdiantarProducao(dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number): Promise<Date> {
        const retries = 40;
        let melhorDia = new Date(dataPonteiro.getTime());//para nao ficar como referencia a data;
        for (const _ of Array(retries)) {
            if (await this.possoAlocarNoDia(melhorDia, setor, item, qtd)) {
                return melhorDia;
            }
            melhorDia = this.calendario.diasPossiveis(this.calendario.subDays(melhorDia, 1), 1)[0];
        }
        throw new Error('nao foi possível encontrar um dia para adiantar a producao');
    }

    async planejamentoDoDia(dia: Date): Promise<PlanejamentoDiario | null> {
        try {
            const inicio = this.calendario.inicioDoDia(dia);
            const fim = this.calendario.finalDoDia(dia);
            return await this.planejamentoDiarioRepo.findOne({
                where: {
                    dia: Between(inicio, fim)
                },
                relations: {
                    planejamentos: true
                }
            });
        } catch (error) {
            throw new Error(`nao foi possível persistir o planejado do dia ${dia.toLocaleString()}`)
        }
    }

    async getPlanejamentosBySetorAndDia(setor: CODIGOSETOR, dia: Date): Promise<Planejamento[]> {
        return await this.planejamentoRepo.find({
            where: {
                planejamentoDiario: {
                    dia: dia
                },
                setor: setor
            }
        });
    }

    async getPlanejamentoByPedido(...pedidos: Pedido[]): Promise<PlanejamentoDiario[]> {
        console.log(pedidos)
        return await this.planejamentoDiarioRepo.find({
            relations: {
                planejamentos: true
            },
            where: {
                planejamentos: {
                    pedido: In(pedidos.map(p => p.id))
                }
            }
        })
    }

    async possoAlocarQuantoNoDia(dia: Date, setor: CODIGOSETOR, item: Item, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number> {
        try {
            // Planejamentos já persistidos no banco
            const planejamentos = await this.planejamentoDiarioRepo
                .createQueryBuilder("pd")
                .innerJoin("pd.planejamentos", "plano")
                .innerJoin("plano.item", "item")
                .where("plano.setor = :setor", { setor: setor })
                .andWhere("DATE(pd.dia) = :dia", { dia: this.calendario.format(dia) })
                .andWhere("item.codigo = :itemCodigo", { itemCodigo: item.getCodigo() })
                .select("plano.qtd", "qtd")
                .getRawMany();

            const totalPlanejadoBanco = planejamentos.reduce((total, p) => total + Number(p.qtd), 0);

            // Planejamentos temporários não persistidos
            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(p =>
                    this.calendario.ehMesmoDia(p.dia, dia) &&
                    p.item.getCodigo() === item.getCodigo() &&
                    p.setor === setor
                )
                .reduce((total, p) => total + p.qtd, 0);

            const capacidade = item.produzaPc(setor);
            const totalPlanejado = totalPlanejadoBanco + totalPlanejadoTemporario;
            const restante = capacidade - totalPlanejado;

            return Math.max(0, restante); // nunca retornar negativo
        } catch (error) {
            console.error(error);
            throw new Error('erro ao analisar a quantidade no dia');
        }
    }

    async possoAlocarNoDia(
        dia: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        planejamentosTemporarios?: PlanejamentoTemporario[]
    ): Promise<boolean> {
        try {
            // Planejamentos reais do banco
            const planejamentos = await this.planejamentoDiarioRepo
                .createQueryBuilder("pd")
                .innerJoin("pd.planejamentos", "plano")
                .innerJoin("plano.item", "item")
                .where("plano.setor = :setor", { setor: setor })
                .andWhere("DATE(pd.dia) = :dia", { dia: this.calendario.format(dia) })
                .andWhere("item.codigo = :itemCodigo", { itemCodigo: item.getCodigo() })
                .select("plano.qtd", "qtd")
                .getRawMany();

            const totalPlanejadoBanco = planejamentos.reduce((total, p) => total + Number(p.qtd), 0);

            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(p =>
                    this.calendario.ehMesmoDia(p.dia, dia) &&
                    p.item.getCodigo() === item.getCodigo() &&
                    p.setor === setor
                )
                .reduce((total, p) => total + p.qtd, 0);

            const totalPlanejado = totalPlanejadoBanco + totalPlanejadoTemporario;
            const capacidade = item.produzaPc(setor);

            return (totalPlanejado + qtd) <= capacidade;
        } catch (error) {
            console.error(error);
            throw new Error('erro ao analisar alocacao no dia');
        }
    }

}