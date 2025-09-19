import { Inject } from "@nestjs/common";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { IValidaFabrica } from "../../@core/interfaces/IValidaFabrica";
import { BuscaPedidosService } from "./BuscaPedidos.service";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { FabricaPlanejadaErradaException } from "../../@core/exception/FabricaPlanejadaErrada.exception";

export class ValidaFabricaPlanejamento
    implements IValidaFabrica {

    @Inject(BuscaPedidosService) private buscarPedido: BuscaPedidosService;
    @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService;

    async valide(fabrica: Fabrica): Promise<void> {
        const map = new Map<number, PlanejamentoSnapShot[]>();
        const pedidosDaFabrica = await this.buscarPedido.pedidosNaFabrica(fabrica);
        const planejamentosDoPedido = await this.consultaPlanejamentoService.consultaPorPedido(fabrica, [...pedidosDaFabrica], new PlanejamentoOverWriteByPedidoService());
        planejamentosDoPedido.forEach(plan => {
            const planTarget = plan.planejamento.pedido.id;
            if (!map.has(planTarget)) {
                map.set(planTarget, []);
            }
            map.get(planTarget)?.push(plan);
        })
        for (const pedido of pedidosDaFabrica) {
            const planejamentoDoPedido = map.get(pedido.id);
            if (!planejamentoDoPedido) throw new FabricaPlanejadaErradaException(fabrica);
            const totalPlanejadoQtd = planejamentoDoPedido.reduce((total, plan) => total += plan.planejamento.qtd, 0);
            if (totalPlanejadoQtd < pedido.getLote()) throw new FabricaPlanejadaErradaException(fabrica);
        }
    }
}