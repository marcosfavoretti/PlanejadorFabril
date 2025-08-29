import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";

export class SelecionaItemRops implements ISelecionarItem {
    seleciona(itens: Item[]): Item {
        if (!itens.length) throw new Error('lista de itens vazia');
        const filtrados = itens.filter(i => !i.getCodigo().includes('-000-'));
        if (!filtrados.length) throw new Error('nenhum item válido encontrado');
        return filtrados[0];
    }
}