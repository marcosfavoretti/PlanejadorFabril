import { Item } from "src/modules/item/@core/entities/Item.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export interface IConsultarRoteiroPrincipal {
    roteiro(item: Item, itensDependetes: Item[]): Promise<CODIGOSETOR[]>
}
export const IConsultarRoteiroPrincipal = Symbol('IConsultarRoteiroPrincipal');