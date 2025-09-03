import { Inject } from "@nestjs/common";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { IConsultaRoteiro } from "../../@core/interfaces/IConsultaRoteiro";
import { IConsultarRoteiroPrincipal } from "../../@core/interfaces/IConsultarRoteiroPrincipal";
import { ItemEstruturado } from "../../@core/classes/ItemEstruturado";

export class RoteiroPrincipal
    implements IConsultarRoteiroPrincipal {
    constructor(
        @Inject(IConsultaRoteiro) private consultaRoteiro: IConsultaRoteiro,
    ) { }

    async roteiro(itemEstruturado: ItemEstruturado): Promise<CODIGOSETOR[]> {
        const roteiroItemFinal = await this.consultaRoteiro.roteiro(itemEstruturado.itemFinal);
        const roteiroItemControle = await this.consultaRoteiro.roteiro(itemEstruturado.itemRops);
        return roteiroItemControle.concat(roteiroItemFinal) as CODIGOSETOR[];
    }

}