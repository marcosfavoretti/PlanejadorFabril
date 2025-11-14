import { IVerificaCapacidade } from '../interfaces/IVerificaCapacidade';

export class VerificaBatelada implements IVerificaCapacidade {
  constructor(private qtdBateladaMax: number) {}
  verificaCapacidade(qtd: number): boolean {
    return this.qtdBateladaMax <= qtd;
  }

  calculaCapacidade(qtd: number): number {
    return this.qtdBateladaMax - qtd;
  }
}
