import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import type { Pedido } from "../entities/Pedido.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Inject, Logger } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "../interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";

export class AlocaPorCapabilidade extends MetodoDeAlocacao {
    constructor(
        @Inject(IGerenciadorPlanejamentConsulta) gerenciador: IGerenciadorPlanejamentConsulta) {
        super(gerenciador);
    }

    private sortStrategy(): (a, b) => number {
        return (a, b) => b - a;
    }

    protected async alocacaoComDependencia(
        pedido: Pedido,
        setor: CODIGOSETOR,
        planejamentoProximoSetor: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = pedido.getItem().getLeadtime(setor);
        const planejamentosProxOrdenados = planejamentoProximoSetor
            .sort(
                this.sortStrategy()
            );
        let restante = pedido.getLote();
        let jaAlocados: number = 0;

        for (const necessidade of planejamentosProxOrdenados) {
            console.log(' CARA', necessidade)
            if (restante <= 0) break;

            const precisoAlocar = necessidade.qtd//planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            console.log('nessa eu preciso alocas', precisoAlocar)

            let dataLimite = leadtime > 0 ? this.calendario.ultimoDiaUtil(
                this.calendario.subDays(necessidade.dia, leadtime),
                true
            ) : necessidade.dia;

            const datas = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                dataLimite, setor, pedido.item, precisoAlocar, planejamentosTemporarios
            );

            const qtdMatriz: number[] = [];

            for (const data of datas) {
                const response = await this.gerenciadorPlan.possoAlocarQuantoNoDia(data, setor, pedido.item, planejamentosTemporarios);
                qtdMatriz.push(response);
            }

            for (const [index, data] of datas.entries()) {
                const possoAlocarNesseDia = qtdMatriz[index];
                const qtdParaAlocar = Math.min(
                    restante,
                    possoAlocarNesseDia,
                    pedido.item.produzaPc(setor)
                );
                if (qtdParaAlocar <= 0) continue;
                planejamentosTemporarios.push({
                    dia: data,
                    item: pedido.item,
                    pedido,
                    qtd: qtdParaAlocar,
                    setor,
                });
                restante -= qtdParaAlocar;
                jaAlocados += qtdParaAlocar;
                if (restante <= 0) break; // encerramento antecipado
            }
        }
        return planejamentosTemporarios;
    }

    protected async alocacao(pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]> {
        try {
            const planejamentosDoPedido: PlanejamentoTemporario[] = [];
            let restante = pedido.getLote();
            dias.sort(this.sortStrategy());
            let i = 0;
            dias.sort((a, b) => b.getTime() - a.getTime());
            while (restante > 0 && i < dias.length) {
                let dia = dias[i];

                let capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(dia, setor, pedido.item, planejamentosDoPedido);
                console.log(`restante em montagem dia ${dia}`, capacidadeRestante);

                if (capacidadeRestante <= 0) {
                    //linha abaixo pode gerar problemas
                    const diasComEncaixe = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(dia, setor, pedido.item, restante, planejamentosDoPedido);
                    dias.push(...diasComEncaixe.slice(1));//começa do segundo elemento pq o outro ja vai ser atributo na interacao atual
                    dia = diasComEncaixe[0];
                    capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(dia, setor, pedido.item, planejamentosDoPedido);
                }

                const quantidadeParaAlocar = Math.min(restante, capacidadeRestante);
                planejamentosDoPedido.push(
                    {
                        dia: dia,
                        item: pedido.item,
                        pedido: pedido,
                        qtd: quantidadeParaAlocar,
                        setor: setor
                    }
                );
                restante -= quantidadeParaAlocar;
                if (restante > 0 && i === dias.length - 1) {
                    const [novaData] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                        this.calendario.subDays(dia, 1),
                        setor,
                        pedido.item,
                        restante,
                        planejamentosDoPedido
                    );
                    dias.push(novaData);
                }
                i++;
            }
            console.log("terminei alocao")
            console.log(planejamentosDoPedido)
            return planejamentosDoPedido;
        } catch (error) {
            console.error(error);
            throw new Error(`Erro ao alocar carga do pedido ${pedido.getCodigo()}`);
        }
    }
} 