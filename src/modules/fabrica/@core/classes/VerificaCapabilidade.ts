import { Item } from "src/modules/item/@core/entities/Item.entity";
import { IVerificaCapacidade } from "../interfaces/IVerificaCapacidade";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export class VerificaCapabilidade implements IVerificaCapacidade{
    constructor(private item: Item,private setor: CODIGOSETOR){}
 
    calculaCapacidade(qtd: number): number {
        return this.item.capabilidade(this.setor) - qtd;
    }

    verificaCapacidade(qtd: number): boolean {
        return this.item.capabilidade(this.setor) <= qtd;
    }
}