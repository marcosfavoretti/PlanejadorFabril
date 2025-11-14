import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';

/**
 * @description todos os itens do array tem que ser do mesmo pedido
 */
export class __RealocacaoProps {
  pedido: Pedido;
  novaData: Date;
  planejamentoPedido: PlanejamentoTemporario[];
  planejamentoFalho: PlanejamentoTemporario;
}
