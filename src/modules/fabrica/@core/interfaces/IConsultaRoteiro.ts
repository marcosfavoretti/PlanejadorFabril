import { Item } from "src/modules/item/@core/entities/Item.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export interface IConsultaRoteiro{
    roteiro(partcode: Item):Promise<CODIGOSETOR[]>;
}
export const IConsultaRoteiro = Symbol('IConsultaRoteiro');