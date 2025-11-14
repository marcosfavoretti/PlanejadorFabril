import type { Planejamento } from '../entities/Planejamento.entity';

export interface ISetorExcecao {
  excecao(planejamento: Planejamento): void;
}
