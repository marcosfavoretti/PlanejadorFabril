import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ISelecionarItem } from "../interfaces/ISelecionarItem";
import { ItemEstruturado } from "./ItemEstruturado";

export class SelecionaItem000 implements ISelecionarItem {
    seleciona(item: ItemEstruturado): Item {
        return item.itemFinal;
    }
}