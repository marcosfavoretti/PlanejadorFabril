import { Fabrica } from '../entities/Fabrica.entity';

export class FalhaAoMapearMudancasException extends Error {
  constructor(private fabrica: Fabrica) {
    super(`Falha ao mapear as mudancas da fabrica ${fabrica.fabricaId}`);
  }
}
