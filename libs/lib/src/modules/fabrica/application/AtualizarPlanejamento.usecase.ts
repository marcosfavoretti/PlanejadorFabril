import { Inject, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AtualizarPlanejamentoDTO } from "@dto/AtualizarPlanejamento.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PlanejamentoService } from "@libs/lib/modules/planejamento/infra/services/Planejamento.service";
import { EntityNotFoundError } from "typeorm";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { IGerenciadorPlanejamentConsulta } from "../@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";
import { Fabrica } from "../@core/entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../@core/entities/PlanejamentoSnapShot.entity";
import { CalculaDividaDaAtualizacao } from "../@core/services/CalculaDividaDaAtualizacao";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { VerificaCapabilidade } from "../@core/classes/VerificaCapabilidade";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { addISOWeekYears, isSameDay } from "date-fns";
import { CalculaDividaDoPlanejamento } from "../@core/services/CalculaDividaDoPlanejamento";
import { PlanejamentoTempOverWriteByPedidoService } from "../@core/services/PlanejamentoTempOverWriteByPedido";

export class AtualizarPlanejamentoUseCase {

    constructor(
        @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService,
        @Inject(FabricaSimulacaoService) private fabricaSimulacaoService: FabricaSimulacaoService,
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(IGerenciadorPlanejamentConsulta) private gerenciadorPlanejado: IGerenciadorPlanejamentConsulta & IGerenciadorPlanejamentoMutation,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(PlanejamentoService) private planejamentoService: PlanejamentoService,
    ) { }

    async atualizar(dto: AtualizarPlanejamentoDTO): Promise<void> {
        try {
            const { dia: diaAtualizado, qtd: qtdAtualizado } = dto;

            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);

            const planejamento = await this.planejamentoService.consultaPlanejamento(dto.planejamendoId);

            const planejamentoSnapShotAlvo = await this.consultaPlanejamentoService.consultaPlanejamentoEspecifico(fabrica, planejamento, new PlanejamentoOverWriteByPedidoService());

            const planejamentoTemporario = PlanejamentoTemporario.createByEntity(planejamentoSnapShotAlvo);

            /**
             * se tiver mudanca de valor eu atualizo o valor da variavel
             */
            qtdAtualizado != undefined && (planejamentoTemporario.qtd = qtdAtualizado);

            /**
             * se tiver mudanca de dia eu vejo se consigo replanejar
             */
            if (!isSameDay(diaAtualizado, planejamento.dia)) {
                console.log('necessario replan')
                const _replanejamentoResultado = await this.fabricaSimulacaoService.replanejar(
                    fabrica,
                    [planejamentoTemporario],
                    diaAtualizado
                );
                //se atualizar o dia o servico de planejamento ja vai salvar o planejamento
                await this.gerenciadorPlanejado.appendPlanejamento(fabrica, planejamento.pedido, _replanejamentoResultado.planejamentos);

                const snapShotParaRemover: number[] = await _replanejamentoResultado.retirado.map(retirado => retirado.planejamentoSnapShotId).filter(Boolean) as number[];

                const snapshotsCompletos = await this.consultaPlanejamentoService.consultaPlanejamentoSnapShots(snapShotParaRemover)
                
                await this.gerenciadorPlanejado.removePlanejamento(fabrica, [...snapshotsCompletos]);

                return;
            }

            /**
             * removo o planejamento redundante para nao sumariazar
             */
            await this.gerenciadorPlanejado.removePlanejamento(fabrica, [planejamentoSnapShotAlvo]);
            //
            //-=-=-=-=-=-=-=-=-=-=
            /**
             * consulto os planejamentos da fabrica para calcular dividas
             */
            const planejamentos = await this.consultaPlanejamentoService.consultaPlanejamentosSnapShots(fabrica);

            const allPlanejamentos = planejamentos.map(plan =>
                PlanejamentoTemporario.createByEntity(plan))
                .concat(planejamentoTemporario);


            await this.gerenciaDividaService.resolverDividasParaSalvar(
                fabrica,
                planejamentoSnapShotAlvo.planejamento.pedido,
                new CalculaDividaDoPlanejamento({
                    pedido: planejamentoSnapShotAlvo.planejamento.pedido,
                    planejamentos: new PlanejamentoTempOverWriteByPedidoService()
                        .resolverOverwrite(
                            allPlanejamentos
                        )
                }),
            );
            //-=-=-=-=-=-=-=-=-=-=
            /**
             * salvo o novo planejamentos
             */
            await this.gerenciadorPlanejado.appendPlanejamento(fabrica, planejamento.pedido, [planejamentoTemporario]);
            //
        }
        catch (error) {
            if (error instanceof EntityNotFoundError) throw new NotFoundException(error);
            throw new InternalServerErrorException(
                `Falha ao atulizar o planejamento ${error.message}`
            );
        }
    }

    private async alocacaoExcedeLimite(
        fabrica: Fabrica,
        originalPlanejamentoSnapShot: PlanejamentoSnapShot,
        planejamentoCandidato: PlanejamentoTemporario
    ): Promise<boolean> {
        const quantoPossoAlocar = await this.gerenciadorPlanejado.possoAlocarQuantoNoDia(
            fabrica,
            planejamentoCandidato.dia,
            planejamentoCandidato.setor,
            planejamentoCandidato.item,
            new VerificaCapabilidade(planejamentoCandidato.item, planejamentoCandidato.setor)
        );
        return (planejamentoCandidato.qtd - originalPlanejamentoSnapShot.planejamento.qtd) <= quantoPossoAlocar;
    }
}