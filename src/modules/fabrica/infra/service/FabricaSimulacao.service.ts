import { Inject, Logger } from "@nestjs/common";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { MercadoSnapShotService } from "./MercadoSnapShot.service";
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
import { PlanejamentoService } from "src/modules/planejamento/infra/services/Planejamento.service";
import { TabelaProducao } from "src/modules/planejamento/@core/entities/TabelaProducao.entity";
import { TabelaProducaoRepository } from "src/modules/planejamento/infra/repositories/TabelaProducao.repository";
import { Repository } from "typeorm";

export class FabricaSimulacaoService {

    constructor(
        @Inject(PlanejamentoService) private planejamentoService: PlanejamentoService,
        @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService,
        @Inject(MercadoSnapShotService) private mercadoSnapShotService: MercadoSnapShotService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(SetorChainFactoryService) private setorChainFactoryService: SetorChainFactoryService,
        @Inject(TabelaProducaoRepository) private tabelaRepo: Repository<TabelaProducao>,
        @Inject(IGerenciadorPlanejamentoMutation) private readonly gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation
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
                // opcional: se possível, execute por pedido dentro de transação
                const { acumulado: acumuladoInicial } = await this.setorChainFactoryService.getFirstSetor().alocar(fabrica, pedido);

                let acumuladoFinal: PlanejamentoTemporario[] = Array.isArray(acumuladoInicial)
                    ? [...acumuladoInicial]
                    : [];

                const planejamentosEmDivida = acumuladoInicial.filter(plan => isBefore(plan.dia, startOfTomorrow()));

                const primeiroSetorDoPipe = this.setorChainFactoryService.getFirstSetor().getSetorCode();

                const planejamentosEmDividaASC = planejamentosEmDivida
                    .filter(p => p.setor === primeiroSetorDoPipe)
                    .sort((a, b) => a.dia.getTime() - b.dia.getTime());


                const planejamentoBase = planejamentosEmDividaASC[0]; // pode ser undefined, trate isso

                console.log('planejamentos em divida', planejamentosEmDivida.map(
                    d => ({
                        data: d.dia,
                        item: d.item.Item,
                        setor: d.setor
                    })
                ))

                if (planejamentosEmDivida.length && planejamentoBase) {
                    this.logger.log('DIVIDA NO PLANEJAMENTO');
                    const targetSetor = this.setorChainFactoryService.getSetor(planejamentoBase.setor);
                    const { adicionado: realocacao, retirado } = await targetSetor.realocar(
                        fabrica,
                        {
                            pedido: pedido,
                            novaData: this.calendario.proximoDiaUtilReplanejamento(planejamentoBase.dia),
                            planejamentoFalho: planejamentoBase,
                            planejamentoPedido: acumuladoInicial,
                        }
                    );
                    acumuladoFinal = realocacao;
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

                acumuladoFinal = acumuladoFinal.filter(plan =>
                    !isBefore(plan.dia, startOfTomorrow()) && // plan.dia >= amanhã
                    !isAfter(plan.dia, plan.pedido.getSafeDate()) // plan.dia <= safeDate
                );

                const planejamentosDoPedido = await this.gerenciadorPlanejamento
                    .appendPlanejamento(fabrica, pedido, acumuladoFinal);
                //

                dividas.push(...dividasSalvas);
                planDiario.push(...planejamentosDoPedido);
            }

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

    async replanejar(fabrica: Fabrica, planejamentosFalhos: PlanejamentoTemporario[], novaData?: Date): Promise<FabricaPlanejamentoResultado> {
        const planDiario: Planejamento[] = [];
        const dividas: Divida[] = [];
        try {
            for (const realocacao of planejamentosFalhos) {
                this.logger.log(`REPLANEJAR ${novaData} ${fabrica.fabricaId}`);

                const planejamentosDoPedidoEmBanco = await this.consultaPlanejamentoService.consultaPorPedido(fabrica, [realocacao.pedido], new PlanejamentoOverWriteByPedidoService());

                const planejamentosAlvos = planejamentosDoPedidoEmBanco.filter(plan => isAfter(plan.planejamento.dia, realocacao.dia));

                const setorAlvo = this.setorChainFactoryService.getSetor(realocacao.setor);

                console.log(planejamentosAlvos)

                const { adicionado, retirado } = await setorAlvo.realocar(
                    fabrica, {
                    pedido: realocacao.pedido,
                    novaData: novaData ? novaData : this.calendario.proximoDiaUtilReplanejamento(new Date()),
                    planejamentoFalho: realocacao,
                    planejamentoPedido: planejamentosAlvos.map(p => PlanejamentoTemporario.createByEntity(p)),
                });

                console.log('afinal', adicionado, retirado)

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