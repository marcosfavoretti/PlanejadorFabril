import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { IVerificaCapacidade } from "../interfaces/IVerificaCapacidade";
import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";

/**
 * @description todos os itens do array tem que ser do mesmo pedido
 */
export class RealocacaoProps {
    pedido: Pedido;
    novaData: Date;
    planejamentoPedido: PlanejamentoTemporario[];
    planejamentoFalho: PlanejamentoTemporario;
}