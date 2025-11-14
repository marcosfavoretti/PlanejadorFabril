import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { ISelecionarItem } from '../../../item/@core/interfaces/ISelecionarItem';
import { ItemEstruturado } from '../../../item/@core/classes/ItemEstruturado';

export class SelecionaItem000 implements ISelecionarItem {
  seleciona(item: ItemEstruturado): Item {
    return item.itemFinal;
  }
}
