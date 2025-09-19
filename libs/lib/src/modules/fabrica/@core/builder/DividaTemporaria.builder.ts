import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { Divida } from "../entities/Divida.entity";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { DividaTemporaria } from "../classes/DividaTemporaria";

export class DividaTemporariaBuilder {
    private _qtd: number;
    private _pedido: Pedido;
    private _setor: Setor;
    private _item: Item;

    qtd(qtd: number): DividaTemporariaBuilder {
        this._qtd = qtd;
        return this;
    }

    pedido(pedido: Pedido): DividaTemporariaBuilder {
        this._pedido = pedido;
        return this;
    }

    setor(setor: CODIGOSETOR): DividaTemporariaBuilder {
        this._setor = { codigo: setor, nome: '' };//gambs
        return this;
    }

    item(item: Item): DividaTemporariaBuilder {
        this._item = item;
        return this;
    }

    build(): DividaTemporaria {
        const divida = new DividaTemporaria();
        divida.qtd = this._qtd;
        divida.pedido = this._pedido;
        divida.setor = this._setor;
        divida.item = this._item;
        return divida;
    }
}
