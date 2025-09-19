import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";

export class DividaTemporaria {
    dividaId?: number;
    
    qtd: number;

    pedido: Pedido;

    setor: Setor;

    item: Item;

    createdAt: Date;
}