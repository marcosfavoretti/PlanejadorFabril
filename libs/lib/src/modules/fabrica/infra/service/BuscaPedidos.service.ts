import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { Inject } from "@nestjs/common";
import { IBuscaAtraso } from "../../@core/interfaces/IBuscaAtraso";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { interval, startOfToday } from "date-fns";

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

    async buscaPedidosNaoIniciados(props: {
        fabrica: Fabrica,
    }): Promise<{ pedido: Pedido[] }> {
        const pedidosNaFabrica = await this.pedidosNaFabrica(props.fabrica);
        const planejamentos = await this.consultaPlanejamento.
            consultaPorPedido(props.fabrica, pedidosNaFabrica, new PlanejamentoOverWriteByPedidoService());
        const planejamentoQueJaForamIniciados = planejamentos
            .filter(plan => plan.planejamento.dia.getTime() <= startOfToday().getTime());
        const pedidosQueJaForamIniciados = new Set(planejamentoQueJaForamIniciados.map(plan => plan.planejamento.pedido.id));
        const pedidos = new Set(planejamentos.map(plan => plan.planejamento.pedido));
        const pedidosNaoIniciados = Array.from(pedidos).filter(ped => !pedidosQueJaForamIniciados.has(ped.id));
        return { pedido: pedidosNaoIniciados };
    }

    async buscaPedidosComColisao(props: {
        fabrica: Fabrica,
        pedidoAlvo: Pedido
    }): Promise<{ pedido: Pedido[] }> {
        const { fabrica, pedidoAlvo } = props;

        const { pedido: pedidosNaoIniciados } = await this.buscaPedidosNaoIniciados({ fabrica });

        const dataAlvoTime = pedidoAlvo.getSafeDate().getTime();

        const pedidosComColisao = pedidosNaoIniciados.filter(pedido => {
            const dataPedidoTime = pedido.getSafeDate().getTime();
            return dataPedidoTime <= dataAlvoTime;
        });

        return {
            pedido: pedidosComColisao
        }
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