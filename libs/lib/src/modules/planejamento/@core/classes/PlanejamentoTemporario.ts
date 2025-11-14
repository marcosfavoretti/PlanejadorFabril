import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { Item } from '../../../item/@core/entities/Item.entity';
import { CODIGOSETOR } from '../enum/CodigoSetor.enum';
import { PlanejamentoSnapShot } from '@libs/lib/modules/fabrica/@core/entities/PlanejamentoSnapShot.entity';

export class PlanejamentoTemporario {
  pedido: Pedido;
  item: Item;
  qtd: number;
  setor: CODIGOSETOR;
  dia: Date;
  planejamentoSnapShotId?: number;

  static createByEntity(
    planejamentoSnapshot: PlanejamentoSnapShot,
  ): PlanejamentoTemporario {
    return {
      planejamentoSnapShotId: planejamentoSnapshot.planejamentoSnapShotId,
      dia: planejamentoSnapshot.planejamento.dia,
      item: planejamentoSnapshot.planejamento.item,
      pedido: planejamentoSnapshot.planejamento.pedido,
      qtd: planejamentoSnapshot.planejamento.qtd,
      setor: planejamentoSnapshot.planejamento.setor.codigo,
    };
  }
}
