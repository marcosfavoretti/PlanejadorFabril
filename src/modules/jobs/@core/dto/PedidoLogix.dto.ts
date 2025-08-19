import { Item } from "src/modules/item/@core/entities/Item.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";

export class PedidoLogixDTO {
    codigo: string;

    identificador: string;

    dataEntrega: Date;

    lote: number;

    item: string;


    static toDomainEntity(pedidoLogix: PedidoLogixDTO): Partial<Pedido> {
        const pedido = new Pedido(
            pedidoLogix.codigo,
            pedidoLogix.dataEntrega,
            {Item: pedidoLogix.item} as unknown as Item,
            pedidoLogix.lote,
            false,
            pedidoLogix.identificador,
        );
        return pedido;
    }

}