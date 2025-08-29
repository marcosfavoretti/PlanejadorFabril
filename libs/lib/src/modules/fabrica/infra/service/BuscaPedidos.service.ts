import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Inject } from "@nestjs/common";

export class BuscaPedidosService {
    constructor(
       @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService
    ) { }

    async pedidosNaFabrica(fabrica: Fabrica): Promise<Pedido[]> {
        const planejamentos = await this.consultaPlanejamento.consultaPlanejamentoAtual(
            fabrica,
            new PlanejamentoOverWriteByPedidoService()
        );

        const pedidosMap = new Map<number, Pedido>();

        for (const plan of planejamentos) {
            const pedido = plan.planejamento.pedido;
            pedidosMap.set(pedido.id, pedido);
        }

        return Array.from(pedidosMap.values());
    }
}