import { PlanejamentoSnapShot } from '../entities/PlanejamentoSnapShot.entity';

export interface IGerenciaOverwrite<T> {
  resolverOverwrite(data: T[]): T[];
}
