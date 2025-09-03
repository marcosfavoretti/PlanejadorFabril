import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";
import { ItemEstruturado } from "./ItemEstruturado";

export class SelecionaItemRops implements ISelecionarItem {
    seleciona(itens: ItemEstruturado): Item {
        return itens.itemRops;
    }
}