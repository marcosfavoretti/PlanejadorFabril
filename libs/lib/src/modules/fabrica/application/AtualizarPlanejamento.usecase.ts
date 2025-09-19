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
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { isSameDay } from "date-fns";
import { Pedido } from "../../pedido/@core/entities/Pedido.entity";
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
            const [fabrica, planejamento] = await Promise.all([
                this.fabricaService.consultaFabrica(dto.fabricaId),
                this.planejamentoService.consultaPlanejamento(dto.planejamendoId)
            ]);

            const planejamentoSnapShotAlvo = await this.consultaPlanejamentoService
                .consultaPlanejamentoEspecifico(
                    fabrica,
                    planejamento,
                    new PlanejamentoOverWriteByPedidoService()
                );

            const planejamentoTemporario = PlanejamentoTemporario.createByEntity(planejamentoSnapShotAlvo);

            
            if (!isSameDay(dto.dia, planejamento.dia)) {
                await this.replanejarDia(fabrica, planejamento.pedido, planejamentoTemporario, dto.dia);
                planejamentoTemporario.dia = dto.dia;
            }
            
            if(dto.qtd !== undefined && !Number.isNaN(dto.qtd)) planejamentoTemporario.qtd = dto.qtd;
            
            await this.substituirPlanejamento(fabrica, planejamentoSnapShotAlvo, planejamentoTemporario);
            await this.calcularEResolverDividas(fabrica, planejamento.pedido);
        }
        catch (error) {
            if (error instanceof EntityNotFoundError) throw new NotFoundException(error);
            throw new InternalServerErrorException(`Falha ao atualizar o planejamento: ${error.message}`);
        }
    }



    private async replanejarDia(
        fabrica: Fabrica,
        pedido: Pedido,
        planejamento: PlanejamentoTemporario,
        novoDia: Date
    ) {
        const resultadoReplanejamento = await this.fabricaSimulacaoService.replanejar(
            fabrica,
            [planejamento],
            novoDia
        );

        await this.gerenciadorPlanejado.appendPlanejamento(fabrica, pedido, resultadoReplanejamento.planejamentos);

        const snapShotParaRemover: number[] = resultadoReplanejamento.retirado
            .map(r => r.planejamentoSnapShotId)
            .filter(Boolean) as number[];

        const snapshotsCompletos = await this.consultaPlanejamentoService.consultaPlanejamentoSnapShots(snapShotParaRemover);
        await this.gerenciadorPlanejado.removePlanejamento(fabrica, snapshotsCompletos);
    }

    private async substituirPlanejamento(
        fabrica: Fabrica,
        snapshotAlvo: PlanejamentoSnapShot,
        planejamentoTemporario: PlanejamentoTemporario
    ) {
        await this.gerenciadorPlanejado.removePlanejamento(fabrica, [snapshotAlvo]);
        await this.gerenciadorPlanejado.appendPlanejamento(fabrica, planejamentoTemporario.pedido, [planejamentoTemporario]);
    }

    private async calcularEResolverDividas(
        fabrica: Fabrica,
        pedido: Pedido,
    ) {
        const planejamentos = await this.consultaPlanejamentoService.consultaPlanejamentoAtual(fabrica, new PlanejamentoOverWriteByPedidoService());

        const allPlanejamentosAsTemporario = planejamentos.map(p =>
            PlanejamentoTemporario.createByEntity(p));


        const dividas = await this.gerenciaDividaService.resolverDividas({
            fabrica,
            pedido,
            planejamentos: allPlanejamentosAsTemporario
        });

        await this.gerenciaDividaService.adicionaDividas(fabrica, dividas);
    }
}
