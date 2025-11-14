import { Divida } from '../entities/Divida.entity';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';

export class FabricaPlanejamentoResultado {
  // divida: Divida[];
  planejamentos: PlanejamentoTemporario[];
}
