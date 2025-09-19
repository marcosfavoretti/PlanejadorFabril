import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";

export class AgPlanejamentoInput {
    pedido: Pedido;
    qtdPorDia: Map<Date, number>;
}