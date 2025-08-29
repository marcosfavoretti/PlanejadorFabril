import { ConsultarTabelaCapabilidadeDTO } from "@dto/ConsultarTabelaCapabilidade.dto";
import { Item } from "../../@core/entities/Item.entity";
import { ItemCapabilidade } from "../../@core/entities/ItemCapabilidade.entity";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { Inject } from "@nestjs/common";
import { SetorService } from "@libs/lib/modules/setor/infra/service/Setor.service";

export class AtualizaCapabilidade {
    constructor(
        @Inject(SetorService) private readonly setorService: SetorService
    ) {}

    async atualizar(item: Item, dto: ConsultarTabelaCapabilidadeDTO): Promise<Item> {
        item.itemCapabilidade = [];
        for (const setorCodigo of Object.keys(dto.capabilidade) as CODIGOSETOR[]) {
            const setor = await this.setorService.consultarSetor(setorCodigo);
            if (!setor) continue;
            const cap = new ItemCapabilidade();
            cap.setor = setor;
            cap.capabilidade = dto.capabilidade[setorCodigo] ?? 0;
            cap.leadTime = dto.leadtime[setorCodigo] ?? 0;
            cap.item = item;
            item.itemCapabilidade.push(cap);
        }
        // Apenas retorna o item atualizado, sem salvar no banco
        return item;
    }
}