import { BadRequestException, Inject, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AdicionarPlanejamentoDTO } from "@dto/AdicionarPlanejamento.dto";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ItemService } from "@libs/lib/modules/item/infra/service/Item.service";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { EntityNotFoundError } from "typeorm";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { CalculaDividaPosPlanManual } from "../@core/services/CalculaDividaPosPlanManual";
import { startOfDay } from "date-fns";

export class AdicionarPlanejamentoManualUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ItemService) private itemService: ItemService,
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(GerenciaDividaService) private gereciaDivida: GerenciaDividaService,
        @Inject(IGerenciadorPlanejamentoMutation) private gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation,
        // @Inject(ConsultaPlanejamentoService) private consultarPlanejamentos: ConsultaPlanejamentoService
    ) { }

    async adicionar(dto: AdicionarPlanejamentoDTO): Promise<PlanejamentoResponseDTO> {
        try {
            const [fabrica, pedido, item] = await Promise.all([
                this.fabricaService.consultaFabrica(dto.fabricaId),
                this.pedidoService.consultarPedido(dto.pedidoId),
                this.itemService.consultarItem(dto.item)
            ]);

            if (fabrica.principal) throw new BadRequestException('Fabricas principais nao podem ser pogramadas diretamente');

            if (!pedido.processado) throw new BadRequestException('Pedido infomardo não foi planejado');

            //
            /**
             * criar um novo planejamento Temporario
             */
            const planejamentoTemporario = new PlanejamentoTemporario();
            planejamentoTemporario.dia = startOfDay(dto.dia);
            planejamentoTemporario.item = item;
            planejamentoTemporario.pedido = pedido;
            planejamentoTemporario.qtd = dto.qtd;
            planejamentoTemporario.setor = dto.setor;
            //

            /**
             * validacao se pode tirar dividas
             */
            const _dividas = await this.gereciaDivida.resolverDividasParaSalvar(
                fabrica,
                pedido,
                new CalculaDividaPosPlanManual({
                    novoPlan: planejamentoTemporario,
                    modo: 'INSERCAO'
                })
            );
            //

            const [planejamentoGerado] = await this.gerenciadorPlanejamento.appendPlanejamento(
                fabrica,
                pedido,
                [planejamentoTemporario]
            );

            return PlanejamentoResponseDTO.fromEntity(planejamentoGerado);
        }
        catch (error) {
            console.error(error);
            if (error instanceof EntityNotFoundError) {
                throw new NotFoundException(`O ${error.entityClass} nao foi achado`)
            }
            throw new InternalServerErrorException(error.message);
        }
    }
}