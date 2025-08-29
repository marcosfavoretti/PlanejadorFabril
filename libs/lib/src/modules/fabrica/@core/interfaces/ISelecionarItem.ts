import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";

export interface ISelecionarItem{
    seleciona(itens:Item[]):Item;
}
export const ISelecionarItem = Symbol('ISelecionarItem');