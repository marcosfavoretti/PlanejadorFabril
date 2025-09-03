import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity"
import { Fabrica } from "../entities/Fabrica.entity"
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario"
import { ItemEstruturado } from "./ItemEstruturado"

export type AlocacaoProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    estrutura: ItemEstruturado,
    planBase?: PlanejamentoTemporario[]
}