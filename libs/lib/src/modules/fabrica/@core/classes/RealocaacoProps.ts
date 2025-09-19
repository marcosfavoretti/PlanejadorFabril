import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity"
import { Fabrica } from "../entities/Fabrica.entity"
import { ItemEstruturado } from "@libs/lib/modules/item/@core/classes/ItemEstruturado"
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario"
import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial"

export type RealocacaoProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    estrutura: ItemEstruturado,
    planFalho: PlanejamentoTemporario
    novoDia: Date,
    planDoPedido: PlanejamentoTemporario[],
    realocacaoUltSetor?: RealocacaoParcial
}