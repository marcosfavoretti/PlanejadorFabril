import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";

export class SalvarPedidoException extends Error{
    constructor(public pedido: Partial<Pedido>){
        super('Nao foi possivel salvar o pedido na aplicacao principal');
    }
}