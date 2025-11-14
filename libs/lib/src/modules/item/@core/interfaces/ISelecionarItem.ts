import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { ItemEstruturado } from '../classes/ItemEstruturado';

export interface ISelecionarItem {
  seleciona(itens: ItemEstruturado): Item;
}
export const ISelecionarItem = Symbol('ISelecionarItem');
