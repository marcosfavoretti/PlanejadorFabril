import { Item } from "../entities/Item.entity";
import { Pedido } from "../entities/Pedido.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export class PlanejamentoTemporario {
    pedido: Pedido;
    item: Item;
    qtd: number;
    setor: CODIGOSETOR;
    dia: Date;
}