import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { RemoverPlanejamentoDTO } from "@dto/RemoverPlanejamento.dto";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PlanejamentoService } from "@libs/lib/modules/planejamento/infra/services/Planejamento.service";
import { EntityNotFoundError } from "typeorm";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoTemporario } from "../../planejamento/@core/classes/PlanejamentoTemporario";

export class RemoverPlanejamentoUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(PlanejamentoService) private planejamentoService: PlanejamentoService,
        @Inject(IGerenciadorPlanejamentoMutation) private gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation
    ) { }

    async remover(dto: RemoverPlanejamentoDTO): Promise<void> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);

            if (fabrica.principal) throw new Error('Essa fabrica nao deve ser alterada');

            const planejamento = await this.planejamentoService
                .consultaPlanejamento(dto.planejamentoId);

            const planejamentoSnapShot = await this.consultaPlanejamentoService
                .consultaPlanejamentoEspecifico(fabrica, planejamento, new PlanejamentoOverWriteByPedidoService())

            await this.gerenciadorPlanejamento.removePlanejamento(
                fabrica,
                [planejamentoSnapShot]
            );

            const planejamentoQtd = planejamento.qtd;

            // const divida = await this.gerenciaDividaService.calcularDividas({
            //     fabrica: fabrica,
            //     pedido: planejamento.pedido,
            //     planejamentos: planja
            // }) 

            const planejamentosDaFabrica = await this.consultaPlanejamentoService
                .consultaPlanejamentoAtual(fabrica, new PlanejamentoOverWriteByPedidoService);
            /**
             * resolucao de dividas da remocao
             */
            const divida = await this.gerenciaDividaService.resolverDividas(
                {
                    fabrica,
                    pedido: planejamento.pedido,
                    planejamentos: planejamentosDaFabrica.map(PlanejamentoTemporario.createByEntity)
                }
            );
            await this.gerenciaDividaService.adicionaDividas(fabrica, divida);
        }
        catch (error) {
            console.error(error);
            if (error instanceof EntityNotFoundError) {
                throw new NotFoundException(error);
            }
            throw new BadRequestException(error.message);
        }
    }
}