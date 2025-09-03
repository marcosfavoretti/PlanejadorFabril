import { BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { RemoverPlanejamentoDTO } from "@dto/RemoverPlanejamento.dto";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PlanejamentoService } from "@libs/lib/modules/planejamento/infra/services/Planejamento.service";
import { EntityNotFoundError } from "typeorm";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { CalculaDividaPosPlanManual } from "../@core/services/CalculaDividaPosPlanManual";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";

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
            const planejamento = await this.planejamentoService.consultaPlanejamento(dto.planejamentoId);
            const planejamentoSnapShot = await this.consultaPlanejamentoService.consultaPlanejamentoEspecifico(fabrica, planejamento, new PlanejamentoOverWriteByPedidoService())
            await this.gerenciadorPlanejamento.removePlanejamento(
                fabrica,
                [planejamentoSnapShot]
            );
            const planejamentoQtd = planejamento.qtd;
            await this.gerenciaDividaService.resolverDividasParaSalvar(
                fabrica,
                planejamento.pedido,
                new CalculaDividaPosPlanManual(
                    {
                        modo: 'REMOCAO',
                        novoPlan: {
                            dia: planejamento.dia,
                            item: planejamento.item,
                            pedido: planejamento.pedido,
                            qtd: planejamentoQtd,
                            setor: planejamento.setor.codigo
                        }
                    }
                )
            );
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