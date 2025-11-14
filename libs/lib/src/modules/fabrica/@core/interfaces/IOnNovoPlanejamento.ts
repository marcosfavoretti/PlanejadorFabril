import { Planejamento } from '@libs/lib/modules/planejamento/@core/entities/Planejamento.entity';
import { Fabrica } from '../entities/Fabrica.entity';

export interface IOnNovoPlanejamentos {
  execute(fabrica: Fabrica, planejamentos: Planejamento[]): Promise<void>;
}
export const IOnNovoPlanejamentos = Symbol('IOnNovoPlanejamentos');
