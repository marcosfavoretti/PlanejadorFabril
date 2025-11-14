import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';

export class ItemEstruturado {
  itemFinal: Item;
  itemRops: Item;
  itensDependencia: Item[];

  /**
   *
   * @param item
   * @description jogo para primeira colocacao do array o item requisitado
   */
  ordenaDependencias(item: Item): void {
    console.log('vou ordenar', item);
    const index = this.itensDependencia.findIndex((dep) => dep === item);
    if (index > -1) {
      const [found] = this.itensDependencia.splice(index, 1);
      this.itensDependencia.unshift(found);
    }
  }

  itensAsList(): Item[] {
    return [this.itemFinal, this.itemRops, ...this.itensDependencia];
  }
}
