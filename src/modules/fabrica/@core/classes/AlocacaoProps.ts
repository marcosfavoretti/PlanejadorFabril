import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity"
import { Fabrica } from "../entities/Fabrica.entity"
import { Item } from "src/modules/item/@core/entities/Item.entity"
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario"

export type AlocacaoProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    estrutura: Item[],
    planBase?: PlanejamentoTemporario[]
}