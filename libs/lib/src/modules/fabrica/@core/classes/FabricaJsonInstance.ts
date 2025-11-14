import { CODIGOSETOR } from '../../../planejamento/@core/enum/CodigoSetor.enum';
import { FabricaJsonPlanejamento } from './FabricaJsonPlanejamento';

export class FabricaJsonInstance {
  mercados: Map<CODIGOSETOR, number>;
  planejamentos: FabricaJsonPlanejamento;
  fabricaPaiId: string;
}
