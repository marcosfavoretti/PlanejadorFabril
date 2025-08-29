import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";

export class SelecionaItemDep implements ISelecionarItem {
    seleciona(itens: Item[]): Item {
        if (!itens.length) throw new Error('lista de itens vazia (_SELECIOAN ITEM DEP)');
        const item  = itens.filter(i => !i.getCodigo().match('-000-')).reverse()[0];
        return item!;
    }
}