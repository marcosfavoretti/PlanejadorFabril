import { Inject } from "@nestjs/common";
import { Item } from "src/modules/item/@core/entities/Item.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { IConsultaRoteiro } from "../../@core/interfaces/IConsultaRoteiro";
import { IConsultarRoteiroPrincipal } from "../../@core/interfaces/IConsultarRoteiroPrincipal";

export class RoteiroPrincipal
    implements IConsultarRoteiroPrincipal {
    constructor(
        @Inject(IConsultaRoteiro) private consultaRoteiro: IConsultaRoteiro,
    ) { }

    async roteiro(item: Item, itensDependetes: Item[]): Promise<CODIGOSETOR[]> {
        if (!item.getCodigo().includes('-000-')) throw new Error('Input so aceita itens finais');
        const roteiroItemFinal = await this.consultaRoteiro.roteiro(item);
        const itemRops = itensDependetes[0];//o rops sempre sera o primeiro lista devido a estrutura
        if(!itemRops) throw new Error('Nao foi possivel identificar o rops');
        const roteiroItemControle = await this.consultaRoteiro.roteiro(itemRops);
        return roteiroItemControle.concat(roteiroItemFinal) as CODIGOSETOR[];

    }




}