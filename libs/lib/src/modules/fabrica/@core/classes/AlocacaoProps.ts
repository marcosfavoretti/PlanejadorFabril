import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity"
import { Fabrica } from "../entities/Fabrica.entity"
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity"
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario"

export type AlocacaoProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    estrutura: Item[],
    planBase?: PlanejamentoTemporario[]
}