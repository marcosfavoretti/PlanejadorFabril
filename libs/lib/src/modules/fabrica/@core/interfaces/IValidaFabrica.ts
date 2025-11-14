import { Fabrica } from '../entities/Fabrica.entity';

export interface IValidaFabrica {
  /**
   *
   * @param fabrica
   * @description o metodo joga uma exception caso a validacao seja falsa
   */
  valide(fabrica: Fabrica): Promise<void>;
}
