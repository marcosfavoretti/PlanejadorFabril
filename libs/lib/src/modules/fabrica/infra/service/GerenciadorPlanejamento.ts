import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import type { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Planejamento } from "../../../planejamento/@core/entities/Planejamento.entity";
import { Inject, Logger } from "@nestjs/common";
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
import { addBusinessDays, isSameDay, subBusinessDays } from "date-fns";

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
        console.time('efetiva')
        const resultados = await this.efetivaPlanejamentoService.efetiva(fabrica, planejamentosNovos);
        console.timeEnd('efetiva')
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

    // async rangeDeDiasPossiveisRetroativos(fabrica: Fabrica,
    //     dataPonteiro: Date,
    //     setor: CODIGOSETOR,
    //     item: Item,
    //     qtd: number,
    //     estrategiaVerificacao: IVerificaCapacidade,
    //     qtdDias?: number,
    //     planTemp?: PlanejamentoTemporario[]
    // ): Promise<Map<Date, number>> {
    //     const responseMap = new Map<Date, number>();
    //     let quantoPreciso = qtd;
    //     let quantosDias = qtdDias || 2;
    //     const diasUsados = new Set<string>();
    //     const MAX_TENTATIVAS = 1_000;
    //     let dataValidacao = new Date(dataPonteiro);
    //     for (let tentativa = 0; (quantoPreciso > 0 && quantosDias > 0); tentativa++) {
    //         const chave = dataValidacao.toISOString().split("T")[0];
    //         if (!diasUsados.has(chave)) {
    //             diasUsados.add(chave);
    //             const quantoAloco = await this.possoAlocarQuantoNoDia(
    //                 fabrica,
    //                 dataValidacao,
    //                 setor,
    //                 item,
    //                 estrategiaVerificacao,
    //                 planTemp
    //             );
    //             if (quantoAloco <= 0) continue;
    //             responseMap.set(dataValidacao, quantoAloco);
    //             quantosDias -= 1;
    //             quantoPreciso -= quantoAloco;
    //         }
    //         dataValidacao = subBusinessDays(dataValidacao, 1);
    //         if (MAX_TENTATIVAS === tentativa) throw Error('Maximo de tentativas atigidas');
    //     }
    //     return responseMap
    // }

    async appendPlanejamento(
        fabrica: Fabrica,
        pedido: Pedido,
        planejamentosTemp: PlanejamentoTemporario[]
    ): Promise<Planejamento[]> {
        await this.planejamentoValidatorExecutor
            .execute(fabrica, pedido, planejamentosTemp);
        const noBancoAtual = await this.consultaPlanejamentoService.consultaPlanejamentoAtual(
            fabrica,
            new PlanejamentoOverWriteByPedidoService()
        );
        for (const planejamentoTemp of planejamentosTemp) {
            const planejamentosSemelhantes = noBancoAtual.filter(
                bd => 
                    isSameDay(bd.planejamento.dia, planejamentoTemp.dia) &&
                    bd.planejamento.item.getCodigo() === planejamentoTemp.item.getCodigo() &&
                    bd.planejamento.setor.codigo === planejamentoTemp.setor &&
                    bd.planejamento.pedido.id === planejamentoTemp.pedido.id
            ).reduce(
                (total, planSnapShot) => total += planSnapShot.planejamento.qtd, 0
            );
            planejamentoTemp.qtd = planejamentosSemelhantes + planejamentoTemp.qtd;
        }//CONCATENA DOIS PLANEJADOS DO MESMO PEDIDO NO MESMO DIA
        const resultados = await this.efetivaPlanejamentoService.efetiva(fabrica, planejamentosTemp);
        return resultados.flatMap(plan => plan.planejamento);
    }

    async diaParaAdiarProducaoEncaixe(
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentoBanco: PlanejamentoTemporario[],
        planejamentosTemporarios: PlanejamentoTemporario[] = []
    ): Promise<Map<Date, number>> {
        const responseMap = new Map<Date, number>();
        const diasUsados = new Set<number>();

        let quantoPreciso = qtd;
        let ponteiro = new Date(dataPonteiro);

        for (let tentativa = 0; tentativa < 2_000 && quantoPreciso > 0; tentativa++) {
            // já usei esse dia?
            if (diasUsados.has(ponteiro.getTime())) {
                ponteiro = this.obterProximoDia(ponteiro);
                continue;
            }
            diasUsados.add(ponteiro.getTime());

            // quanto consigo alocar nesse dia
            const capacidade = await this.possoAlocarQuantoNoDia(
                ponteiro,
                setor,
                item,
                estrategiaVerificacao,
                planejamentoBanco,
                planejamentosTemporarios
            );

            if (capacidade > 0) {
                responseMap.set(new Date(ponteiro.getTime()), capacidade);
                quantoPreciso -= capacidade;
            }

            ponteiro = this.obterProximoDia(ponteiro);
        }

        if (quantoPreciso > 0) {
            throw new Error(
                `Não foi possível adiar a produção: setor=${setor}, pedido=${qtd}, faltaram=${quantoPreciso}, diasTestados=${diasUsados.size}`
            );
        }

        return responseMap;
    }

    // helper privado
    private obterProximoDia(atual: Date): Date {
        const proximo = this.calendario.proximoDiaUtilReplanejamento(atual);
        if (proximo.getTime() === atual.getTime()) {
            // fallback: tenta pelo menos avançar 1 dia útil
            return addBusinessDays(atual, 1);
        }
        return proximo;
    }

    /**
     * @param dataPonteiro 
     * @param setor 
     * @param item 
     * @param qtd 
     * @returns Map com os dias e quanto foi alocado em cada um
     * @description Busca dias anteriores ao dataPonteiro que juntos totalizam a quantidade de produção pedida
     */
    async diaParaAdiantarProducaoEncaixe(
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentoBanco: PlanejamentoTemporario[],
        planejamentosTemporarios: PlanejamentoTemporario[] = []
    ): Promise<Map<Date, number>> {
        const resultado = new Map<Date, number>();
        const diasUsados = new Set<number>();

        let quantoPreciso = qtd;
        let ponteiro = new Date(dataPonteiro);

        for (let tentativa = 0; tentativa < 2_000 && quantoPreciso > 0; tentativa++) {
            // já usei esse dia?
            if (diasUsados.has(ponteiro.getTime())) {
                ponteiro = this.obterDiaAnterior(ponteiro);
                continue;
            }
            diasUsados.add(ponteiro.getTime());

            // quanto consigo alocar nesse dia
            const capacidade = await this.possoAlocarQuantoNoDia(
                ponteiro,
                setor,
                item,
                estrategiaVerificacao,
                planejamentoBanco,
                planejamentosTemporarios
            );

            if (capacidade > 0) {
                resultado.set(new Date(ponteiro.getTime()), capacidade);
                quantoPreciso -= capacidade;
            }

            ponteiro = this.obterDiaAnterior(ponteiro);
        }

        if (quantoPreciso > 0) {
            throw new Error(
                `Não foi possível adiantar a produção: setor=${setor}, pedido=${qtd}, faltaram=${quantoPreciso}, diasTestados=${diasUsados.size}`
            );
        }

        return resultado;
    }

    // helper privado
    private obterDiaAnterior(atual: Date): Date {
        const anterior = subBusinessDays(atual, 1);
        if (anterior.getTime() === atual.getTime()) {
            return atual; // evita loop preso
        }
        return anterior;
    }

    async possoAlocarQuantoNoDia(
        dia: Date,
        setor: CODIGOSETOR,
        item: Item,
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentosBanco: PlanejamentoTemporario[],
        planejamentosTemporarios?: PlanejamentoTemporario[]
    ): Promise<number> {
        try {

            const filterMesmoDiaEMesmoitemEMesmoSetor = (p: PlanejamentoTemporario) => (isSameDay(p.dia, dia) &&
                p.item.getCodigo() === item.getCodigo() &&
                p.setor === setor
            );
            /**
             * soma planejados do mesmo setor, item e dia
             */
            const totalPlanejadoSalvo = planejamentosBanco
                .filter(filterMesmoDiaEMesmoitemEMesmoSetor)
                .reduce((total, p) => total + p.qtd, 0);

            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(filterMesmoDiaEMesmoitemEMesmoSetor)
                .reduce((total, p) => total + p.qtd, 0);
            //
            const totalPlanejado = totalPlanejadoSalvo + totalPlanejadoTemporario;
            const restante = estrategiaVerificacao.calculaCapacidade(totalPlanejado);
            return Math.max(0, restante);
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
        estrategiaVerificacao: IVerificaCapacidade,
        planejamentoBanco: PlanejamentoTemporario[],
        planejamentosTemporarios?: PlanejamentoTemporario[]
    ): Promise<boolean> {
        try {

            const filterMesmoDiaEMesmoitemEMesmoSetor = (p: PlanejamentoTemporario) => (isSameDay(p.dia, dia) &&
                p.item.getCodigo() === item.getCodigo() &&
                p.setor === setor
            );

            const totalPlanejadoSalvo = planejamentoBanco
                .filter(filterMesmoDiaEMesmoitemEMesmoSetor)
                .reduce((total, p) => total + Number(p.qtd), 0);

            const totalPlanejadoTemporario = (planejamentosTemporarios ?? [])
                .filter(filterMesmoDiaEMesmoitemEMesmoSetor)
                .reduce((total, p) => total + p.qtd, 0);

            const totalPlanejado = totalPlanejadoSalvo + totalPlanejadoTemporario;

            return estrategiaVerificacao.verificaCapacidade(totalPlanejado + qtd)
        } catch (error) {
            console.error(error);
            throw new Error('erro ao analisar alocacao no dia');
        }
    }

}