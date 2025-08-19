import { Inject } from "@nestjs/common";
import { PedidoRepository } from "../repositories/Pedido.repository";
import { Pedido } from "../../@core/entities/Pedido.entity";
import { EntityNotFoundError, In, MoreThanOrEqual } from "typeorm";

export class PedidoService {
    constructor(
        @Inject(PedidoRepository) private pedidoRepository: PedidoRepository
    ) { }

    async consultarPedido(pedidoId: number): Promise<Pedido> {
        return await this.pedidoRepository.findOneOrFail({
            where: {
                id: pedidoId
            }
        });
    }

    async consultaPedidosPlanejadosOuNPlanejados(soPlanejado: boolean): Promise<Pedido[]> {
        return soPlanejado ? await this.consultarPedidosPlanejados() : await this.consultarPedidosNPlanejados()
    }

    private async consultarPedidosPlanejados(): Promise<Pedido[]> {
        return await this.pedidoRepository.find({
            where: {
                processado: true
            }
        })
    }

    private async consultarPedidosNPlanejados(): Promise<Pedido[]> {
        return await this.pedidoRepository.find({
            where: {
                processado: false
            }
        })
    }

    async consultarPedidosNoPeriodo(): Promise<Pedido[]> {
        const agora = new Date();
        return await this.pedidoRepository.find({
            where: [
                { processado: false },
                { dataEntrega: MoreThanOrEqual(new Date()) }
            ]
        });
    }


    async consultarPedidos(pedidosId: number[]): Promise<Pedido[]> {
        const pedido = await this.pedidoRepository.find({
            where: {
                id: In(pedidosId)
            }
        });
        if (!pedido.length) throw new EntityNotFoundError(Pedido, 'not found error');
        return pedido;
    }

    async savePedido(pedidos: Pedido[]|Partial<Pedido>[]): Promise<Pedido[]> {
        return await this.pedidoRepository.save(pedidos);
    }
}