import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { ISelecionarItem } from '../../../item/@core/interfaces/ISelecionarItem';
import { ItemEstruturado } from '../../../item/@core/classes/ItemEstruturado';

/**
 * @description retorna sempre a primeira dependencia. Logo se tiver porta e janela e a janela tiver no primeiro index, ela sera retornada
 */
export class SelecionaItemDep implements ISelecionarItem {
  seleciona(itens: ItemEstruturado): Item {
    return itens.itensDependencia[0];
  }
}
