import { Item } from "src/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";

export class SelecionaItemRops implements ISelecionarItem {
    seleciona(itens: Item[]): Item {
        if (!itens.length) throw new Error('lista de itens vazia');
        const filtrados = itens.filter(i => !i.getCodigo().includes('-000-'));
        console.log(filtrados[0])
        if (!filtrados.length) throw new Error('nenhum item válido encontrado');
        console.log(filtrados[0].getCodigo());
        return filtrados[0];
    }
}