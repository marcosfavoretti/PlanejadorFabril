import { Inject } from "@nestjs/common";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { ReplanejarPedidoDTO } from "src/delivery/dtos/ReplanejarPedido.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PedidoService } from "src/modules/pedido/infra/service/Pedido.service";
import { ApagaPedidoPlanejadoService } from "../infra/service/ApagaPedidoPlanejado.service";

export class ReplanejarPedidoUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(ApagaPedidoPlanejadoService) private apagaPedidoPlanejadoService: ApagaPedidoPlanejadoService,
        @Inject(FabricaSimulacaoService) private fabricaSimulacao: FabricaSimulacaoService
    ) { }

    async replanejar(dto: ReplanejarPedidoDTO): Promise<void> {
        const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
        const pedido = await this.pedidoService.consultarPedido(dto.pedidoId);
       
        await this.apagaPedidoPlanejadoService.apagar(
            fabrica,
            pedido
        )
       
        const { divida, planejamentos } = await this.fabricaSimulacao.planejamento(
            fabrica,
            [pedido]
        );
        
    }
}