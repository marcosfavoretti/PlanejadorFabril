import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Inject } from "@nestjs/common";
import { IBuscaAtraso } from "../../@core/interfaces/IBuscaAtraso";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";

export class BuscaPedidosService
    implements IBuscaAtraso {
        
    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService
    ) { }

    //da interface busca atraso essa funcao
    async buscaAtraso(fabrica: Fabrica, pedidos: Pedido[]): Promise<PlanejamentoSnapShot[]> {
        const planejamentos = await this.consultaPlanejamento.consultaPorPedido(fabrica, pedidos, new PlanejamentoOverWriteByPedidoService());
        return planejamentos.filter(plans => plans.ehAtrasado());
    }

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