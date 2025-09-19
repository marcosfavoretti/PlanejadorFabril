import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import type { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Planejamento } from "../../../planejamento/@core/entities/Planejamento.entity";
import { Inject } from "@nestjs/common";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { Item } from "../../../item/@core/entities/Item.entity";
import { IGerenciadorPlanejamentConsulta } from "../../@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../../../planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { EfetivaPlanejamentoService } from "./EfetivaPlanejamento.service";
import { PlanejamentoValidatorExecutorService } from "../../@core/services/PlanejamentoValidatorExecutor.service";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { IVerificaCapacidade } from "../../@core/interfaces/IVerificaCapacidade";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { addBusinessDays, subBusinessDays, subDays } from "date-fns";

export class GerenciadorPlanejamento implements
    IGerenciadorPlanejamentoMutation,
    IGerenciadorPlanejamentConsulta {

    private calendario: Calendario = new Calendario();

    constructor(
        @Inject(PlanejamentoValidatorExecutorService) private planejamentoValidatorExecutor: PlanejamentoValidatorExecutorService,
        @Inject(EfetivaPlanejamentoService) private efetivaPlanejamentoService: EfetivaPlanejamentoService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
    ) { }

    async appendReplanejamento(
        fabrica: Fabrica,
        pedido: Pedido,
        planejamentosOriginais: PlanejamentoSnapShot[],
        planejamentosNovos: PlanejamentoTemporario[]
    ): Promise<Planejamento[]> {
        await this.planejamentoValidatorExecutor.execute(fabrica, pedido, planejamentosNovos);
        const resultados = await this.efetivaPlanejamentoService.efetiva(fabrica, planejamentosNovos);
        return resultados.flatMap(plan => plan.planejamento);
    }


    async removePlanejamento(
        fabrica: Fabrica,
        planejamento: PlanejamentoSnapShot[]
    ): Promise<void> {
        // const planejamentoSnapShot = await this.consultaPlanejamentoService.consultaPlanejamentoEspecifico(
        //     fabrica,
        //     planejamento,
        //     new PlanejamentoOverWriteByPedidoService()
        // );
        const planPromises = planejamento.map(m => this.efetivaPlanejamentoService.remove(fabrica, m));
        await Promise.all(planPromises);
    }

    async rangeDeDiasPossiveisRetroativos(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, qtdDias?: number, planTemp?: PlanejamentoTemporario[]): Promise<Map<Date, number>> {
        const responseMap = new Map<Date, number>();
        let quantoPreciso = qtd;
        let quantosDias = qtdDias || 2;
        const diasUsados = new Set<string>();
        const MAX_TENTATIVAS = 1_000;
        let dataValidacao = new Date(dataPonteiro);
        for (let tentativa = 0; (quantoPreciso > 0 && quantosDias > 0); tentativa++) {
            const chave = dataValidacao.toISOString().split("T")[0];
            if (!diasUsados.has(chave)) {
                diasUsados.add(chave);
                const quantoAloco = await this.possoAlocarQuantoNoDia(
                    fabrica,
                    dataValidacao,
                    setor,
                    item,
                    estrategiaVerificacao,
                    planTemp
                );
                if (quantoAloco <= 0) continue;
                responseMap.set(dataValidacao, quantoAloco);
                quantosDias -= 1;
                quantoPreciso -= quantoAloco;
            }
            dataValidacao = subBusinessDays(dataValidacao, 1);
            if(MAX_TENTATIVAS===tentativa) throw Error('Maximo de tentativas atigidas');
        }
        return responseMap
    }

    async appendPlanejamento(fabrica: Fabrica, pedido: Pedido, planejamentosTemp: PlanejamentoTemporario[]): Promise<Planejamento[]> {
        await this.planejamentoValidatorExecutor
            .execute(fabrica, pedido, planejamentosTemp);
        for (const planejamentoTemp of planejamentosTemp) {
            const planejamentoSemelhante = await this.consultaPlanejamentoService.consultaItemNoSetorNoDia(
                fabrica,
                planejamentoTemp.item,
                planejamentoTemp.setor,
                planejamentoTemp.dia,
                new PlanejamentoOverWriteByPedidoService()
            );
            const planejamentoSemelhanteQtd = planejamentoSemelhante
                .filter(p => p.planejamento.pedido.id === pedido.id)
                .reduce((total, planSnapShot) => total += planSnapShot.planejamento.qtd, 0);
            planejamentoTemp.qtd = planejamentoSemelhanteQtd + planejamentoTemp.qtd;
        }//CONCATENA DOIS PLANEJADOS DO MESMO PEDIDO NO MESMO DIA
        const resultados = await this.efetivaPlanejamentoService.efetiva(fabrica, planejamentosTemp);
        return resultados.flatMap(plan => plan.planejamento);
    }

    async diaParaAdiarProducaoEncaixe(
        fabrica: Fabrica,
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentosTemporarios: PlanejamentoTemporario[] = []
    ): Promise<Date[]> {
        const maxTentativas = 2_000;
        let quantoPreciso = qtd;
        console.log(`preciso alocarr ${qtd}`)
        const encontrouDatas: Date[] = [];
        const diasUsados = new Set<number>();
        let ponteiro = new Date(dataPonteiro);
        for (let tentativa = 0; tentativa < maxTentativas && quantoPreciso > 0; tentativa++) {
            if (diasUsados.has(ponteiro.getTime())) {
                const proximo = this.calendario.proximoDiaUtilReplanejamento(ponteiro);
                if (proximo.getTime() === ponteiro.getTime()) break; // sem avanço possível
                ponteiro = proximo;
                continue;
            }
            diasUsados.add(ponteiro.getTime());
            const capacidade = await this.possoAlocarQuantoNoDia(
                fabrica,
                ponteiro,
                setor,
                item,
                estrategiaVerificacao,
                planejamentosTemporarios
            );
            if (capacidade > 0) {
                encontrouDatas.push(new Date(ponteiro));
                quantoPreciso -= capacidade;
            }
            console.log(quantoPreciso, capacidade)
            const proximo = addBusinessDays(ponteiro, 1);
            if (proximo.getTime() === ponteiro.getTime()) break; // evita loop preso
            ponteiro = proximo;
        }
        if (quantoPreciso > 0) {
            throw new Error(`Não foi possível encontrar dias suficientes para adiar a produção. ${dataPonteiro.toLocaleDateString()} ${setor} ${qtd}`);
        }
        return encontrouDatas;
    }

    /**
     * @param dataPonteiro 
     * @param setor 
     * @param item 
     * @returns 
     * @description Devolvo uma lista de dias que juntam totalizam a quantidade de producao que foi pedido
     */
    async diaParaAdiantarProducaoEncaixe(
        fabrica: Fabrica,
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentosTemporarios: PlanejamentoTemporario[] = []
    ): Promise<Date[]> {
        const maxTentativas = 2_000;
        let quantoPreciso = qtd;
        console.log(`preciso alocarr ${qtd}`)
        const encontrouDatas: Date[] = [];
        const diasUsados = new Set<number>();
        let ponteiro = dataPonteiro;
        for (let tentativa = 0; tentativa < maxTentativas && quantoPreciso > 0; tentativa++) {
            if (diasUsados.has(ponteiro.getTime())) {
                const proximo = subBusinessDays(ponteiro, 1);
                if (proximo.getTime() === ponteiro.getTime()) break; // sem avanço possível
                ponteiro = proximo;
                continue;
            }
            diasUsados.add(ponteiro.getTime());
            const capacidade = await this.possoAlocarQuantoNoDia(
                fabrica,
                ponteiro,
                setor,
                item,
                estrategiaVerificacao,
                planejamentosTemporarios
            );

            if (capacidade > 0) {
                encontrouDatas.push(new Date(ponteiro));
                quantoPreciso -= capacidade;
            }

            console.log(quantoPreciso, capacidade)

            ponteiro = subBusinessDays(ponteiro, 1);
        }

        if (quantoPreciso > 0) {
            throw new Error(`Não foi possível encontrar dias suficientes para adiar a produção. ${dataPonteiro.toLocaleDateString()} ${setor} ${qtd}`);
        }

        return encontrouDatas;
        // const retries = 100;
        // let quantoPreciso = qtd;
        // const findDates: Array<Date> = [];
        // let diaAlvo = dataPonteiro;
        // const diasUsados = new Set<number>();

        // for (let i = 0; i < retries && quantoPreciso > 0; i++) {
        //     // Evita repetir o mesmo dia
        //     if (diasUsados.has(diaAlvo.getTime())) {
        //         diaAlvo = this.calendario.diasPossiveis(this.calendario.subDays(diaAlvo, 1), 1)[0];
        //         continue;
        //     }
        //     diasUsados.add(diaAlvo.getTime());
        //     const capacidadePersistida = await this.possoAlocarQuantoNoDia(
        //         fabrica,
        //         diaAlvo,
        //         setor,
        //         item,
        //         estrategiaVerificacao,
        //         planejamentosTemporarios
        //     );
        //     if (capacidadePersistida > 0) {
        //         findDates.push(diaAlvo);
        //         quantoPreciso -= capacidadePersistida;
        //     }
        //     diaAlvo = this.calendario.diasPossiveis(this.calendario.subDays(diaAlvo, 1), 1)[0];
        // }
        // if (quantoPreciso > 0) {
        //     throw new Error('Não foi possível encontrar dias suficientes para adiantar a produção.');
        // }
        // return findDates;
    }



    async possoAlocarQuantoNoDia(fabrica: Fabrica, dia: Date, setor: CODIGOSETOR, item: Item, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number> {
        try {
            const planejamentos = await this.consultaPlanejamentoService
                .consultaItemNoSetorNoDia(
                    fabrica,
                    item,
                    setor,
                    dia,
                    new PlanejamentoOverWriteByPedidoService()
                );

            const totalPlanejadoSalvo = planejamentos
                .reduce((total, p) => total + Number(p.planejamento.qtd), 0);

            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(p =>
                    this.calendario.ehMesmoDia(p.dia, dia) &&
                    p.item.getCodigo() === item.getCodigo() &&
                    p.setor === setor
                )
                .reduce((total, p) => total + p.qtd, 0);

            const totalPlanejado = totalPlanejadoSalvo + totalPlanejadoTemporario;
            const restante = estrategiaVerificacao.calculaCapacidade(totalPlanejado);
            console.log(`ve aqui ${setor}`, totalPlanejadoSalvo, totalPlanejadoTemporario, totalPlanejado, restante)
            return Math.max(0, restante);
        } catch (error) {
            console.error(error);
            throw new Error('erro ao analisar a quantidade no dia');
        }
    }

    async possoAlocarNoDia(
        fabrica: Fabrica,
        dia: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentosTemporarios?: PlanejamentoTemporario[]
    ): Promise<boolean> {
        try {
            const planejamentos = await this.consultaPlanejamentoService
                .consultaItemNoSetorNoDia(fabrica, item, setor, dia, new PlanejamentoOverWriteByPedidoService());

            const totalPlanejadoSalvo = planejamentos
                .reduce((total, p) => total + Number(p.planejamento.qtd), 0);

            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(p =>
                    this.calendario.ehMesmoDia(p.dia, dia) &&
                    p.pedido.item.getCodigo() === item.getCodigo() &&
                    p.setor === setor
                )
                .reduce((total, p) => total + p.qtd, 0);

            const totalPlanejado = totalPlanejadoSalvo + totalPlanejadoTemporario;

            return estrategiaVerificacao.verificaCapacidade(totalPlanejado + qtd)
        } catch (error) {
            console.error(error);
            throw new Error('erro ao analisar alocacao no dia');
        }
    }

}