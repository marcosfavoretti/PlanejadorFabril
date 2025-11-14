import { Mudancas } from '../classes/Mudancas';
import { Fabrica } from '../entities/Fabrica.entity';

export interface IComparaMudancasFabrica {
  compara(
    fabricaA: Fabrica,
    fabricaB: Fabrica,
  ): Promise<Mudancas[]> | Mudancas[];
}
