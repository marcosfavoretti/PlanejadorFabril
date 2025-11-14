import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { IVerificaCapacidade } from '../interfaces/IVerificaCapacidade';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';

export class VerificaCapabilidade implements IVerificaCapacidade {
  constructor(
    private item: Item,
    private setor: CODIGOSETOR,
  ) {
    if (!item.getCodigo().match('-000-')) {
      throw new Error(
        'Só esperados itens 000 aqui. Pois só eles tem leadTimes',
      );
    }
  }

  calculaCapacidade(qtd: number): number {
    return this.item.capabilidade(this.setor) - qtd;
  }

  verificaCapacidade(qtd: number): boolean {
    return this.item.capabilidade(this.setor) <= qtd;
  }
}
