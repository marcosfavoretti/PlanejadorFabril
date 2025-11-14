import { Fabrica } from '../entities/Fabrica.entity';

/**
 * @description cada alteracao do checkpoint tem que ser gravado por referencia no objeto para ser passado a diante
 */
export interface IGeraCheckPoint {
  gerar(fabricaAtual: Fabrica, fabricaPassada: Fabrica): Promise<void>;
}
