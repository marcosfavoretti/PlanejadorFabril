import { Inject, Logger } from "@nestjs/common";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { FabricaPlanejamentoResultado } from "../../@core/classes/FabricaPlanejamentoResultado";
import { ErroDeValidacao } from "../../@core/exception/ErroDeValidacao.exception";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { isAfter, isBefore, isSameDay, startOfTomorrow } from "date-fns";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { SetorChainFactoryService } from "../../@core/services/SetorChainFactory.service";
import { IConsultarRoteiroPrincipal } from "../../@core/interfaces/IConsultarRoteiroPrincipal";
import { SetorService } from "@libs/lib/modules/planejamento/@core/abstract/SetorService";
import { IConsultaRoteiro } from "../../@core/interfaces/IConsultaRoteiro";
import { AlocaItensDependencias } from "@libs/lib/modules/planejamento/@core/services/AlocaItensDependencias";
import { SelecionaItemDep } from "../../@core/classes/SelecionaItemDep";
import { IGerenciadorPlanejamentConsulta } from "../../@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { IMontaEstrutura } from "../../@core/interfaces/IMontaEstrutura.ts";
import { FabricaReplanejamentoResultado } from "../../@core/classes/FabricaReplanejamentoResultado";
import { ItemEstruturado } from "../../@core/classes/ItemEstruturado";

export class FabricaSimulacaoService {

    constructor(
        @Inject(IMontaEstrutura) private montaEstruturaEstrategia: IMontaEstrutura,
        @Inject(IConsultaRoteiro) private consultaRoteiro: IConsultaRoteiro,
        @Inject(IConsultarRoteiroPrincipal) private consultaRoteiroPrincipal: IConsultarRoteiroPrincipal,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(SetorChainFactoryService) private setorChainFactoryService: SetorChainFactoryService,
        @Inject(IGerenciadorPlanejamentoMutation) private readonly gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation & IGerenciadorPlanejamentConsulta
    ) { }

    calendario = new Calendario();
    logger = new Logger();


    async planejamento(fabrica: Fabrica, pedido: Pedido): Promise<FabricaPlanejamentoResultado> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];

        try {
            const estrutura = await this.montaEstruturaEstrategia.monteEstrutura(pedido.item);
            this.logger.log(estrutura);

            // 1. Planejamento principal (já retorna o pipe também)
            const { planInicial, pipePrincipal } = await this.alocaItemPrincipal(fabrica, pedido, estrutura);
            planejamentosTemporarios.push(...planInicial);

            // 2. Ajusta range se necessário
            const pivot = this.getPlanejamentoPivot(planInicial, pipePrincipal);

            if (pivot) {
                const planoAjustado = await this.arrumaRangeDoPlanejamento({
                    fabrica,
                    pedido,
                    pipeProducao: pipePrincipal,
                    planPivot: pivot,
                    planOriginal: planInicial
                });
                planejamentosTemporarios.splice(0, planejamentosTemporarios.length, ...planoAjustado);
            }

            // 3. Dependências
            if (estrutura.itensDependencia.length > 0) {
                const plansDeps = await this.alocaDependencias(fabrica, pedido, estrutura, planejamentosTemporarios);
                planejamentosTemporarios.push(...plansDeps);
            }

            return { planejamentos: planejamentosTemporarios };
        }
        catch (error) {
            console.error('[planejamento] erro geral ao processar pedidos', { error });
            if (error instanceof ErroDeValidacao) throw error;
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`problema ao salvar planejamentos temporarios: ${msg}`);
        }
    }

    private async gerarPipeDeProducao(estrutura: ItemEstruturado): Promise<SetorService> {
        const roteiro = await this.consultaRoteiroPrincipal.roteiro(estrutura);
        return this.setorChainFactoryService.modificarCorrente(roteiro);
    }

    private async alocaItemPrincipal(
        fabrica: Fabrica,
        pedido: Pedido,
        estrutura: any
    ): Promise<{ planInicial: PlanejamentoTemporario[], pipePrincipal: SetorService }> {
        const pipe = await this.gerarPipeDeProducao(estrutura)

        const { acumulado } = await pipe.alocar({ fabrica, pedido, estrutura });
        return { planInicial: acumulado, pipePrincipal: pipe };
    }

    private getPlanejamentoPivot(
        planInicial: PlanejamentoTemporario[],
        pipe: SetorService
    ): PlanejamentoTemporario | null {
        const foraDoRange = this.selecionaPlansForaDoRange(planInicial);
        const foraDoRangeAsc = this.organizaPlansOrdemCronologica(planInicial, pipe);
        return foraDoRange.length ? foraDoRangeAsc[0] : null;
    }

    private async alocaDependencias(
        fabrica: Fabrica,
        pedido: Pedido,
        estrutura: any,
        planejamentosTemporarios: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]> {
        const acumulados: PlanejamentoTemporario[] = [];

        for (const item of [...estrutura.itensDependencia]) {
            estrutura.ordenaDependencias(item);

            const setoresDoItem = await this.consultaRoteiro.roteiro(item);
            const pipe = this.setorChainFactoryService.modificarCorrente(setoresDoItem);

            this.setorChainFactoryService.setMetodoDeAlocacaoCustomTodos(
                pipe,
                setoresDoItem,
                new AlocaItensDependencias(this.gerenciadorPlanejamento, new SelecionaItemDep())
            );

            const { acumulado } = await pipe.alocar({
                fabrica,
                pedido,
                estrutura,
                planBase: planejamentosTemporarios
            });

            acumulados.push(...acumulado);
        }
        return acumulados;
    }

    async replanejar(fabrica: Fabrica, planejamentosFalhos: PlanejamentoTemporario[], novaData?: Date):
        Promise<FabricaReplanejamentoResultado> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const planejamentosTemporariosRetirados: PlanejamentoTemporario[] = [];

        try {
            for (const realocacao of planejamentosFalhos) {
                this.logger.log(`REPLANEJAR ${novaData} ${fabrica.fabricaId}`);

                const planejamentosDoPedidoEmBanco = await this.consultaPlanejamentoService
                    .consultaPorPedido(fabrica, [realocacao.pedido], new PlanejamentoOverWriteByPedidoService());

                const planejamentosAlvos = planejamentosDoPedidoEmBanco.filter(plan =>
                    isSameDay(plan.planejamento.dia, realocacao.dia) ||
                    isAfter(plan.planejamento.dia, realocacao.dia)
                );

                const estrutura = await this.montaEstruturaEstrategia.monteEstrutura(realocacao.pedido.item);

                const roteiro = await this.consultaRoteiroPrincipal.roteiro(estrutura);

                const pipeSetoresCustom = this.setorChainFactoryService
                    .modificarCorrente(roteiro);

                const setorAlvo = pipeSetoresCustom
                    .getSetorInChain(realocacao.setor);

                const { adicionado, retirado } = await setorAlvo.realocar(
                    fabrica, {
                    pedido: realocacao.pedido,
                    novaData: novaData ? novaData : this.calendario.proximoDiaUtilReplanejamento(new Date()),
                    planejamentoFalho: realocacao,
                    planejamentoPedido: planejamentosAlvos.map(p => PlanejamentoTemporario.createByEntity(p)),
                });

                //salvamento do planejamento & validacao final
                console.log('RESULTA FINAL', adicionado);
                //\\
                planejamentosTemporarios.push(...adicionado);
                planejamentosTemporariosRetirados.push(...retirado);
            }
            return {
                planejamentos: planejamentosTemporarios,
                retirado: planejamentosTemporariosRetirados,
            }
        }
        catch (error) {
            console.error(error);
            if (error instanceof ErroDeValidacao) {
                throw error;
            }
            throw new Error(`problema ao salvar planejamentos temporarios: ${error.message}`);
        }
    }


    private organizaPlansOrdemCronologica(planejamentos: PlanejamentoTemporario[], pipeSetores: SetorService): PlanejamentoTemporario[] {
        const planejamentosForaDoRangeASC = planejamentos
            .filter(p => p.setor === pipeSetores.getSetorCode())
            .sort((a, b) => a.dia.getTime() - b.dia.getTime());
        return planejamentosForaDoRangeASC;

    }

    private selecionaPlansForaDoRange(planejamentos: PlanejamentoTemporario[]): PlanejamentoTemporario[] {
        const planejamentosForaDoRange = planejamentos.filter(plan => isBefore(plan.dia, startOfTomorrow()));
        return planejamentosForaDoRange;
    }

    private async arrumaRangeDoPlanejamento(props: {
        fabrica: Fabrica,
        pedido: Pedido,
        planOriginal: PlanejamentoTemporario[],
        planPivot: PlanejamentoTemporario,
        pipeProducao: SetorService
    }): Promise<PlanejamentoTemporario[]> {
        //
        this.logger.log('DIVIDA NO PLANEJAMENTO');

        const primeiroSetorDoPipe = props.pipeProducao.getSetorInChain(props.planPivot.setor);

        const { adicionado: realocacao } = await primeiroSetorDoPipe.realocar(
            props.fabrica,
            {
                pedido: props.pedido,
                novaData: this.calendario.proximoDiaUtilReplanejamento(props.planPivot.dia),
                planejamentoFalho: props.planPivot,
                planejamentoPedido: props.planOriginal,
            }
        );
        return realocacao;
    }
}