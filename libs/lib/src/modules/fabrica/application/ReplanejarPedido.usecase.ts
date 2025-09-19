import { Inject } from "@nestjs/common";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { ReplanejarPedidoDTO } from "@dto/ReplanejarPedido.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { ApagaPedidoPlanejadoService } from "../infra/service/ApagaPedidoPlanejado.service";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";
import { ICalculoDivida } from "../@core/interfaces/ICalculoDivida";

export class ReplanejarPedidoUseCase {
    constructor(
        @Inject(ICalculoDivida) private calculoDivida: ICalculoDivida,
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService,
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(ApagaPedidoPlanejadoService) private apagaPedidoPlanejadoService: ApagaPedidoPlanejadoService,
        @Inject(IGerenciadorPlanejamentoMutation) private gerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
        @Inject(FabricaSimulacaoService) private fabricaSimulacao: FabricaSimulacaoService
    ) { }

    async replanejar(dto: ReplanejarPedidoDTO): Promise<void> {
        const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
        const pedido = await this.pedidoService.consultarPedido(dto.pedidoId);

        await Promise.all([
            this.apagaPedidoPlanejadoService.apagar(
                fabrica,
                pedido
            ),
            this.gerenciaDividaService.apagarDividas(
                fabrica,
                pedido
            )
        ])

        const { planejamentos } = await this.fabricaSimulacao.planejamento(
            fabrica,
            pedido
        );

        const dividas = await this.gerenciaDividaService
            .resolverDividas({
                fabrica,
                pedido,
                planejamentos
            });

        await this.gerenciaDividaService
            .adicionaDividas(fabrica, dividas);

        await this.gerenciadorPlanejamentoMutation
            .appendPlanejamento(fabrica, pedido, planejamentos);
    }
}