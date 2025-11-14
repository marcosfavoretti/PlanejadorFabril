import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';
import { FabricaPlanejamentoResultado } from './FabricaPlanejamentoResultado';

export class FabricaReplanejamentoResultado extends FabricaPlanejamentoResultado {
  retirado: PlanejamentoTemporario[];
}
