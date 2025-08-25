import { Inject, Logger } from "@nestjs/common";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { FabricaPlanejamentoResultado } from "../../@core/classes/FabricaPlanejamentoResultado";
import { Divida } from "../../@core/entities/Divida.entity";
import { ErroDeValidacao } from "../../@core/exception/ErroDeValidacao.exception";
import { CalculaDividaDoPlanejamento } from "../../@core/services/CalculaDividaDoPlanejamento";
import { GerenciaDividaService } from "./GerenciaDivida.service";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { isAfter, isBefore, startOfTomorrow } from "date-fns";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { SetorChainFactoryService } from "../../@core/services/SetorChainFactory.service";
import { TabelaProducao } from "src/modules/planejamento/@core/entities/TabelaProducao.entity";
import { TabelaProducaoRepository } from "src/modules/planejamento/infra/repositories/TabelaProducao.repository";
import { Repository } from "typeorm";
import { IConsultarRoteiroPrincipal } from "../../@core/interfaces/IConsultarRoteiroPrincipal";
import { IBuscarItemDependecias } from "src/modules/item/@core/interfaces/IBuscarItemDependecias";
import { SetorService } from "src/modules/planejamento/@core/abstract/SetorService";
import { IConsultaRoteiro } from "../../@core/interfaces/IConsultaRoteiro";
import { AlocaItensDependencias } from "src/modules/planejamento/@core/services/AlocaItensDependencias";
import { SelecionaItemDep } from "../../@core/classes/SelecionaItemDep";
import { IGerenciadorPlanejamentConsulta } from "../../@core/interfaces/IGerenciadorPlanejamentoConsulta";

export class FabricaSimulacaoService {

    constructor(
        @Inject(IBuscarItemDependecias) private buscarDependencias: IBuscarItemDependecias,
        @Inject(IConsultaRoteiro) private consultaRoteiro: IConsultaRoteiro,
        @Inject(IConsultarRoteiroPrincipal) private consultaRoteiroPrincipal: IConsultarRoteiroPrincipal,
        @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(SetorChainFactoryService) private setorChainFactoryService: SetorChainFactoryService,
        @Inject(TabelaProducaoRepository) private tabelaRepo: Repository<TabelaProducao>,
        @Inject(IGerenciadorPlanejamentoMutation) private readonly gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation & IGerenciadorPlanejamentConsulta
    ) { }

    calendario = new Calendario();
    logger = new Logger();

    async planejamento(fabrica: Fabrica, pedidos: Pedido[]): Promise<FabricaPlanejamentoResultado> {
        const planDiario: Planejamento[] = [];
        const dividas: Divida[] = [];

        if (!pedidos || pedidos.length === 0) {
            return { divida: [], planejamentos: [] };
        }

        try {
            for (const pedido of pedidos) {

                const itensDepedencias = await this.buscarDependencias.buscar(pedido.item);

                console.log(itensDepedencias)

                const roteiro = await this.consultaRoteiroPrincipal.roteiro(pedido.item, itensDepedencias);

                const estrutura = itensDepedencias.concat(pedido.item);

                console.log(`ROTEIRO PRINCIPAL ${roteiro}`);

                const pipeDeSetoresCustom = this.setorChainFactoryService.modificarCorrente(roteiro);

                console.log(estrutura.map(a=>a.getCodigo()))

                const { acumulado: acumuladoInicial } = await pipeDeSetoresCustom.alocar({
                    fabrica,
                    pedido,
                    estrutura
                });

                let acumuladoFinal: PlanejamentoTemporario[] = Array.isArray(acumuladoInicial)
                    ? [...acumuladoInicial]
                    : [];

                const planejamentosEmDivida = acumuladoInicial
                    .filter(plan => isBefore(plan.dia, startOfTomorrow()));

                const planejamentosEmDividaASC = planejamentosEmDivida
                    .filter(p => p.setor === pipeDeSetoresCustom.getSetorCode())
                    .sort((a, b) => a.dia.getTime() - b.dia.getTime());

                const planejamentoBase = planejamentosEmDividaASC[0];

                console.log('planejamentos em divida', planejamentosEmDivida.map(
                    d => ({
                        data: d.dia,
                        item: d.item.Item,
                        setor: d.setor
                    })
                ));

                //caso a divida exista planejados que estao fora do range valido
                if (planejamentosEmDivida.length && planejamentoBase) {
                    acumuladoFinal = await this.arrumaRangeDoPlanejamento({
                        fabrica: fabrica,
                        pedido: pedido,
                        pipeProducao: pipeDeSetoresCustom,
                        planBase: planejamentoBase,
                        planOriginal: acumuladoInicial
                    });
                }
                //->
                if (itensDepedencias.length > 0) {
                    for (const item of itensDepedencias) { // percorre todos
                        const setoresDoItem = await this.consultaRoteiro.roteiro(item);
                        console.log(setoresDoItem)
                        const pipeDependenciasCustom = this.setorChainFactoryService.modificarCorrente(setoresDoItem);
                        console.log(pipeDependenciasCustom.getSetoresInChain(setoresDoItem).map(a=>a.getSetorCode()));

                        this.setorChainFactoryService.setMetodoDeAlocacaoCustomTodos(
                            pipeDependenciasCustom,
                            setoresDoItem,
                            new AlocaItensDependencias(
                                this.gerenciadorPlanejamento,
                                new SelecionaItemDep()
                            )
                        );

                        const { acumulado: acumuladoDeps } = await pipeDependenciasCustom.alocar({
                            fabrica,
                            pedido,
                            estrutura: itensDepedencias,
                            planBase: acumuladoFinal
                        });

                        itensDepedencias.pop();
                        // não precisa remover da estrutura
                        console.log(acumuladoDeps)

                        acumuladoFinal.push(...acumuladoDeps);
                    }
                }

                console.log(acumuladoInicial.sort((a, b) => a.dia.getTime() - b.dia.getTime()).map(a => a.dia.toLocaleDateString()))

                console.log(acumuladoFinal.sort((a, b) => a.dia.getTime() - b.dia.getTime()).map(a => a.dia.toLocaleDateString()))

                const dividasSalvas = await this.gerenciaDividaService.resolverDividasParaSalvar(
                    fabrica,
                    pedido,
                    new CalculaDividaDoPlanejamento({
                        planejamentos: acumuladoFinal,
                        pedido,
                    })
                );

                //corto os dias que estao fora do range de data e ja foram contabilizados como dividas
                acumuladoFinal = acumuladoFinal.filter(plan =>
                    !isBefore(plan.dia, startOfTomorrow()) && // plan.dia >= amanhã
                    !isAfter(plan.dia, plan.pedido.getSafeDate()) // plan.dia <= safeDate
                );

                //salvo no banco meus planejamentos
                const planejamentosDoPedido = await this.gerenciadorPlanejamento
                    .appendPlanejamento(fabrica, pedido, acumuladoFinal);
                //

                dividas.push(...dividasSalvas);
                planDiario.push(...planejamentosDoPedido);
            }

            //da para jogar em um servico para encapsular isso
            const tabelas: TabelaProducao[] = planDiario
                .map(planejamento =>
                    this.tabelaRepo.create({
                        datePlanej: planejamento.dia,
                        planejamento: planejamento,
                    })
                );

            await this.tabelaRepo.save(tabelas);

            return {
                divida: dividas,
                planejamentos: planDiario,
            };
        }
        catch (error) {
            console.error('[planejamento] erro geral ao processar pedidos', { error });
            if (error instanceof ErroDeValidacao) {
                throw error;
            }
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`problema ao salvar planejamentos temporarios: ${msg}`);
        }
    }

    private async arrumaRangeDoPlanejamento(props: { fabrica: Fabrica, pedido: Pedido, planOriginal: PlanejamentoTemporario[], planBase: PlanejamentoTemporario, pipeProducao: SetorService, }): Promise<PlanejamentoTemporario[]> {
        this.logger.log('DIVIDA NO PLANEJAMENTO');
        const targetSetor = props.pipeProducao.getSetorInChain(props.planBase.setor);

        const { adicionado: realocacao, retirado } = await targetSetor.realocar(
            props.fabrica,
            {
                pedido: props.pedido,
                novaData: this.calendario.proximoDiaUtilReplanejamento(props.planBase.dia),
                planejamentoFalho: props.planBase,
                planejamentoPedido: props.planOriginal,
            }
        );
        return realocacao;
    }

    async replanejar(fabrica: Fabrica, planejamentosFalhos: PlanejamentoTemporario[], novaData?: Date): Promise<FabricaPlanejamentoResultado> {
        const planDiario: Planejamento[] = [];
        const dividas: Divida[] = [];

        try {
            for (const realocacao of planejamentosFalhos) {
                this.logger.log(`REPLANEJAR ${novaData} ${fabrica.fabricaId}`);

                const planejamentosDoPedidoEmBanco = await this.consultaPlanejamentoService
                    .consultaPorPedido(fabrica, [realocacao.pedido], new PlanejamentoOverWriteByPedidoService());

                const planejamentosAlvos = planejamentosDoPedidoEmBanco.filter(plan => isAfter(plan.planejamento.dia, realocacao.dia));

                const depedencias = await this.buscarDependencias.buscar(realocacao.pedido.item);

                const roteiro = await this.consultaRoteiroPrincipal.roteiro(realocacao.pedido.item, depedencias);

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

                //calculo se teve divida & salvamento
                const dividasSalvas = await this.gerenciaDividaService
                    .resolverDividasParaSalvar(
                        fabrica,
                        realocacao.pedido,
                        new CalculaDividaDoPlanejamento({
                            planejamentos: adicionado,
                            pedido: realocacao.pedido
                        })
                    );

                //salvamento do planejamento & validacao final
                console.log('RESULTA FINAL', adicionado);

                const planejamentosDoPedido = await this.gerenciadorPlanejamento
                    .appendReplanejamento(fabrica, realocacao.pedido, planejamentosAlvos, adicionado);
                //

                for (const plan_retirado of retirado) {
                    if (plan_retirado.planejamentoSnapShotId) {
                        const planSnapshot = await this.consultaPlanejamentoService.consultaPlanejamentoSnapShot(plan_retirado.planejamentoSnapShotId!);
                        await this.gerenciadorPlanejamento.removePlanejamento(fabrica, planSnapshot);
                    }
                }

                dividas.push(...dividasSalvas);

                planDiario.push(...planejamentosDoPedido);
                //
            }
            return {
                divida: dividas,
                planejamentos: planDiario
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

}