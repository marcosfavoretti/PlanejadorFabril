import { Inject } from "@nestjs/common";
import { ConsultartPorPedidoDto } from "src/delivery/dtos/ConsultarPedido.dto";
import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { IGerenciadorPlanejamentConsulta } from "../@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { FabricaRepository } from "../infra/repository/Fabrica.repository";
import { PedidoRepository } from "src/modules/pedido/infra/repositories/Pedido.repository";


/**
 * @deprecated
 */
export class ConsultartPedidoUseCase {
    // constructor(
    //     @Inject(FabricaRepository) private fabricaRepository: FabricaRepository,
    //     @Inject(PedidoRepository) private pedidoRepository: PedidoRepository,
    //     @Inject(IGerenciadorPlanejamentConsulta) private gerenciamentoPlanejamento: IGerenciadorPlanejamentConsulta
    // ) { }

    // async consultar(dto: ConsultartPorPedidoDto): Promise<Planejamento[]> {
    //     const fabrica = await this.fabricaRepository.findOneOrFail({
    //         where: {
    //             fabricaId: dto.fabricaId
    //         }
    //     });
    //     const pedido = await this.pedidoRepository.findOneOrFail({
    //         where: {
    //             id: dto.pedidoId
    //         }
    //     });
    //     const gerenciamentoPlanejamento = await this.gerenciamentoPlanejamento
    //         .getPlanejamentoByPedido(fabrica, pedido);
            
    //     return gerenciamentoPlanejamento;
    // }
}