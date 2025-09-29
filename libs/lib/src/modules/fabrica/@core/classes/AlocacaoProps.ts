import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity"
import { Fabrica } from "../entities/Fabrica.entity"
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario"
import { ItemEstruturado } from "../../../item/@core/classes/ItemEstruturado"

export type AlocacaoProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    estrutura: ItemEstruturado,
    /**
     * @description planejamento fabril corrente na fabrica. Ele deve conter todos os planejamentos para serem validados
     */
    planejamentoFabril: PlanejamentoTemporario[];
    /**
     * @description serve para adicionar contexto de alguma planejamento que ja foi feito. Por exemplo para planejar as dependencias eu passo o planejamento base do Rops da estrutura
     */
    planBase?: PlanejamentoTemporario[];
}