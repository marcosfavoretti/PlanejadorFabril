import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";

export class FalhaNoPlanejarException extends Error {
    constructor(public pedidos: Pedido[]){
        super('Falha ao planejar o pedido exception');
    }
}