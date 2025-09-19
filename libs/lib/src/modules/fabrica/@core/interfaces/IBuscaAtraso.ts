import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Fabrica } from "../entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../entities/PlanejamentoSnapShot.entity";

export const IBuscaAtraso = Symbol('IBuscaAtraso');
export interface IBuscaAtraso {
    buscaAtraso(fabrica: Fabrica, pedidos: Pedido[]): Promise<PlanejamentoSnapShot[]>;
}