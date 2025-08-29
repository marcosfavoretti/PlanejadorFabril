import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";

export class SelecionaItem000 implements ISelecionarItem {
    seleciona(itens: Item[]): Item {
        const item = itens.find(item => item.getCodigo().match('-000-'));
        if(!item) throw new Error('nao existe item 000 na estrutura passada');
        return item;
    }
}