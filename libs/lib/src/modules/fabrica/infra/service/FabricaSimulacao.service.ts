import { Inject, Logger } from "@nestjs/common";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { FabricaPlanejamentoResultado } from "../../@core/classes/FabricaPlanejamentoResultado";
import { ErroDeValidacao } from "../../@core/exception/ErroDeValidacao.exception";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { isBefore, startOfTomorrow } from "date-fns";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { SetorChainFactoryService } from "../../@core/services/SetorChainFactory.service";
import { IConsultarRoteiroPrincipal } from "../../../item/@core/interfaces/IConsultarRoteiroPrincipal";
import { SetorService } from "@libs/lib/modules/planejamento/@core/abstract/SetorService";
import { IConsultaRoteiro } from "../../../item/@core/interfaces/IConsultaRoteiro";
import { AlocaItensDependencias } from "@libs/lib/modules/planejamento/@core/services/AlocaItensDependencias";
import { IGerenciadorPlanejamentConsulta } from "../../@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { IMontaEstrutura } from "../../../item/@core/interfaces/IMontaEstrutura.ts";
import { FabricaReplanejamentoResultado } from "../../@core/classes/FabricaReplanejamentoResultado";
import { ItemEstruturado } from "../../../item/@core/classes/ItemEstruturado";
import { RealocaPedidoTodoService } from "@libs/lib/modules/replanejamento/@core/service/RealocaPedidoTodo.service";
import { SelecionaItemRops } from "../../@core/classes/SelecionaItemRops";
import { RealocaDependenciaService } from "@libs/lib/modules/replanejamento/@core/service/RealocaDependencia.service";
import { SelecionaItemDep } from "../../@core/classes/SelecionaItemDep";

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

            // 1. Planejamento principal (já retorna o pipe também)
            const { planInicial, pipePrincipal } = await this.alocaItemPrincipal(fabrica, pedido, estrutura);

            planejamentosTemporarios.push(...planInicial);

            // 2. Ajusta range se necessário
            const pivot = this.getPlanejamentoPivot(planInicial, pipePrincipal);

            if (pivot) {
                const planoAjustado = await this.arrumaRangeDoPlanejamento({
                    fabrica,
                    pedido,
                    itemEstruct: estrutura,
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
                new AlocaItensDependencias(this.gerenciadorPlanejamento)
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

    async replanejarDependencia(
        props: {
            fabrica: Fabrica,
            estrutura: ItemEstruturado,
            planejamentoPedido: PlanejamentoTemporario[],
            planejamentoFalho: PlanejamentoTemporario,
            novaData?: Date
        }):
        Promise<FabricaReplanejamentoResultado> {

        Logger.debug('Foi por dependecia');

        const resultado = new FabricaReplanejamentoResultado();

        //filtra dos planejamentos apenas os planejamentos que incluem o item que esta sendo alvo da açao
        const planejamentosDependentes = props.planejamentoPedido.
            filter(plan => plan.item === props.planejamentoFalho.item);

        const [roteiro, roteiroItemFinal] = await Promise.all([
            this.consultaRoteiro.roteiro(props.planejamentoFalho.item),
            this.consultaRoteiro.roteiro(props.estrutura.itemFinal)
        ])

        const roteiroCompleto = roteiro//.concat(roteiroItemFinal); TODO adicionar o item final aqui para caso as dependencias tambem nao tiverem sido feitas ate a data ele replanejar o produto 000

        const pipeProducao = this.setorChainFactoryService.modificarCorrente(roteiroCompleto);

        props.estrutura.ordenaDependencias(props.planejamentoFalho.item);

        this.setorChainFactoryService.setMetodoDeRealocacaoCustomTodos(
            pipeProducao,
            roteiroCompleto,
            new RealocaDependenciaService(this.gerenciadorPlanejamento, new SelecionaItemDep())
        );

        const resultadoAlocacao = await pipeProducao.realocar(
            {
                estrutura: props.estrutura,
                fabrica: props.fabrica,
                novoDia: props.novaData || startOfTomorrow(),
                pedido: props.planejamentoFalho.pedido,
                planDoPedido: planejamentosDependentes,
                planFalho: props.planejamentoFalho,
            }
        );
        [resultado.planejamentos, resultado.retirado] = [resultadoAlocacao.adicionado, resultadoAlocacao.retirado];
        return resultado;
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

                const planejamentosAlvos = planejamentosDoPedidoEmBanco;

                const estrutura = await this.montaEstruturaEstrategia.monteEstrutura(realocacao.pedido.item);

                console.log('estruct', estrutura);

                if (estrutura.itensDependencia.map(i=>i.Item).includes(realocacao.item.Item)) {
                    //sempre que for realocar uma dependencia eu entro aqui
                    const response = await this.replanejarDependencia({
                        fabrica,
                        estrutura,
                        planejamentoFalho: realocacao,
                        planejamentoPedido: planejamentosDoPedidoEmBanco.map(PlanejamentoTemporario.createByEntity),
                        novaData
                    });
                    return response;
                }

                const roteiro = await this.consultaRoteiroPrincipal.roteiro(estrutura);

                const pipeSetoresCustom = this.setorChainFactoryService
                    .modificarCorrente(roteiro);

                const setorAlvo = pipeSetoresCustom
                    .getSetorInChain(realocacao.setor);

                const planDoPedidoPrincipal = planejamentosAlvos.filter(
                    plan => [estrutura.itemFinal.getCodigo(), estrutura.itemRops.getCodigo()].includes(plan.planejamento.item.getCodigo()));

                const { adicionado, retirado } = await setorAlvo.realocar(
                    {
                        estrutura: estrutura,
                        fabrica: fabrica,
                        novoDia: novaData ? novaData : this.calendario.proximoDiaUtilReplanejamento(new Date()),
                        pedido: realocacao.pedido,
                        planFalho: realocacao,
                        planDoPedido: planDoPedidoPrincipal.map(PlanejamentoTemporario.createByEntity),
                    }
                );

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
        itemEstruct: ItemEstruturado,
        planOriginal: PlanejamentoTemporario[],
        planPivot: PlanejamentoTemporario,
        pipeProducao: SetorService
    }): Promise<PlanejamentoTemporario[]> {
        //
        this.logger.log('DIVIDA NO PLANEJAMENTO');

        const primeiroSetorDoPipe = props.pipeProducao
            .getSetorInChain(props.planPivot.setor);

        primeiroSetorDoPipe.setMetodoDeReAlocacao(
            new RealocaPedidoTodoService(
                this.gerenciadorPlanejamento,
                new SelecionaItemRops()
            )
        )

        const { adicionado: realocacao } = await primeiroSetorDoPipe.realocar(
            {
                fabrica: props.fabrica,
                estrutura: props.itemEstruct,
                novoDia: this.calendario.proximoDiaUtilReplanejamento(props.planPivot.dia),
                pedido: props.pedido,
                planDoPedido: props.planOriginal,
                planFalho: props.planPivot,
            }
        );

        return realocacao;
    }
}