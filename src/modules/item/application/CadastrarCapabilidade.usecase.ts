import { Inject, InternalServerErrorException } from "@nestjs/common";
import { ItemService } from "../infra/service/Item.service";
import { ConsultarTabelaCapabilidadeDTO } from "src/delivery/dtos/ConsultarTabelaCapabilidade.dto";
import { AtualizaCapabilidade } from "../infra/service/AtualizaCapabilidade.service";

export class CadastrarItemCapabilidadeUseCase {
    constructor(
        @Inject(ItemService) private itemService: ItemService,
        @Inject(AtualizaCapabilidade) private atualizaCapabilidade: AtualizaCapabilidade
    ) { }

    async cadastrar(dto: ConsultarTabelaCapabilidadeDTO): Promise<void> {
        try {
            const item = await this.itemService.consultarItem(dto.item);
            const itemNovo = await this.atualizaCapabilidade.atualizar(item, dto);
            await this.itemService.salvarItem(itemNovo);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}