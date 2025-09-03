import { Inject } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { IGerenciadorPlanejamentoMutation } from "../../@core/interfaces/IGerenciadorPlanejamento";

export class ApagaPedidoPlanejadoService {
    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(IGerenciadorPlanejamentoMutation) private gerenciadorPlanejamentoMutation : IGerenciadorPlanejamentoMutation
    ) { }

    async apagar(fabrica: Fabrica, pedido: Pedido): Promise<void> {
        const planejamentos = await this.consultaPlanejamentoService.consultaPorPedido(
            fabrica,
            [pedido],
            new PlanejamentoOverWriteByPedidoService()
        );
        for(const planejamento of planejamentos){
            await this.gerenciadorPlanejamentoMutation.removePlanejamento(
                fabrica,
                [planejamento]
            )
        }
    }
}