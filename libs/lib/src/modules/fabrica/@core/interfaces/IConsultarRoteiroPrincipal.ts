import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { ItemEstruturado } from "../classes/ItemEstruturado";

export interface IConsultarRoteiroPrincipal {
    roteiro(itemEstrutura: ItemEstruturado): Promise<CODIGOSETOR[]>
}
export const IConsultarRoteiroPrincipal = Symbol('IConsultarRoteiroPrincipal');