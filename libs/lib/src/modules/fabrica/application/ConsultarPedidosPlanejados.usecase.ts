import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ConsutlarFabricaDTO } from "@dto/ConsultarFabrica.dto";
import { PedidosPlanejadosResponseDTO } from "@dto/PedidosPlanejadosResponse.dto";
import { DividaService } from "../infra/service/Divida.service";
import { BuscaPedidosService } from "../infra/service/BuscaPedidos.service";

export class ConsultarPedidosPlanejadosUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(DividaService) private dividaService: DividaService,
        @Inject(BuscaPedidosService) private buscarPedido: BuscaPedidosService,
    ) { }

    async consultar(dto: ConsutlarFabricaDTO): Promise<PedidosPlanejadosResponseDTO[]> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);

            const pedidos = await this.buscarPedido.pedidosNaFabrica(fabrica);

            const dividaMatrix2x2 = await Promise.all(
                pedidos.map(pedido => this.dividaService.consultarDividaTotalizadaDoPedido(fabrica, pedido))
            );

            // return pedidos.map((pedido, idx) =>
            //     PedidosPlanejadosResponseDTO.fromEntity(
            //         pedido,
            //         dividaMatrix2x2[idx].map(snapshot => snapshot.divida)
            //     )
            // );

            return pedidos.map((pedido, idx) => ({
                dividas: dividaMatrix2x2[idx],
                pedido: {
                    ...pedido,
                    item: pedido.item.Item
                }
            }))
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error)
        }
    }
}