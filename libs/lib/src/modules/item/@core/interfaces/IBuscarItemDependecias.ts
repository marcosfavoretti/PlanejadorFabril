import { Item } from '../entities/Item.entity';

export interface IBuscarItemDependecias {
  /**
   *
   * @param item
   * @description o ultimo item sempre sera o rops
   */
  buscar(item: Item): Promise<Item[]>;
}
export const IBuscarItemDependecias = Symbol('IBuscarItemDependecias');
