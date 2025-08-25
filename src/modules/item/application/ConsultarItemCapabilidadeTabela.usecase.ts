import { ConsultarTabelaCapabilidadeDTO } from "src/delivery/dtos/ConsultarTabelaCapabilidade.dto";
import { ItemService } from "../infra/service/Item.service";
import { Inject } from "@nestjs/common";

export class ConsultarItemCapabilidadeTabelaUseCase {
    constructor(
        @Inject(ItemService) private itemService: ItemService
    ) { }

    async consultar(): Promise<ConsultarTabelaCapabilidadeDTO[]> {
        const itens = await this.itemService.consultarTodosItens();
        return itens.map(item => ConsultarTabelaCapabilidadeDTO.fromEntities(item))
    }
}