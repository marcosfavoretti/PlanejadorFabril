import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { ItemEstruturado } from "../classes/ItemEstruturado";

export interface IMontaEstrutura {
    monteEstrutura(item: Item):Promise<ItemEstruturado>;
}

export const IMontaEstrutura = Symbol('IMontaEstrutura');