import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Fabrica } from "../entities/Fabrica.entity";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { DividaTemporaria } from "../classes/DividaTemporaria";

export const ICalculoDivida = Symbol('ICalculoDivida');

export type CalculaDividaDoPlanejamentoProps = {
    fabrica: Fabrica
    pedido: Pedido,
    planejamentos: PlanejamentoTemporario[],
}

/**
 * para forcar o decrecimo de uma divida retorne um divida de valor negativo
 */
export interface ICalculoDivida {
    calc(props: CalculaDividaDoPlanejamentoProps): Promise<DividaTemporaria[]> | DividaTemporaria[];
}
