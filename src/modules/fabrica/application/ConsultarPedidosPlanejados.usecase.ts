import { Inject } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ConsutlarFabricaDTO } from "src/delivery/dtos/ConsultarFabrica.dto";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";
import { PedidosPlanejadosResponseDTO } from "src/delivery/dtos/PedidosPlanejadosResponse.dto";
import { DividaService } from "../infra/service/Divida.service";
import { DividaSnapShot } from "../@core/entities/DividaSnapShot.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";

export class ConsultarPedidosPlanejadosUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(DividaService) private dividaService: DividaService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService
    ) { }

    async consultar(dto: ConsutlarFabricaDTO): Promise<PedidosPlanejadosResponseDTO[]> {
        const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);

        const planejamentos = await this.consultaPlanejamento.consultaPlanejamentoAtual(
            fabrica,
            new PlanejamentoOverWriteByPedidoService()
        );

        const pedidosMap = new Map<number, Pedido>();

        for (const plan of planejamentos) {
            const pedido = plan.planejamento.pedido;
            pedidosMap.set(pedido.id, pedido);
        }

        const pedidos = Array.from(pedidosMap.values());

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
    }
}