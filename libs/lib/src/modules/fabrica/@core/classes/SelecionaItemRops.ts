import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { ISelecionarItem } from '../../../item/@core/interfaces/ISelecionarItem';
import { ItemEstruturado } from '../../../item/@core/classes/ItemEstruturado';

export class SelecionaItemRops implements ISelecionarItem {
  seleciona(itens: ItemEstruturado): Item {
    return itens.itemRops;
  }
}
