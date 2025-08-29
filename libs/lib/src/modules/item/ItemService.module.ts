import { Module } from "@nestjs/common";
import { ItemService } from "./infra/service/Item.service";
import { ItemRepository } from "./infra/repository/Item.repository";
import { AtualizaCapabilidade } from "./infra/service/AtualizaCapabilidade.service";
import { SetorServiceModule } from "../setor/SetorService.module";

@Module({
    imports: [
        SetorServiceModule
    ],
    providers: [
        ItemRepository,
        ItemService,
        AtualizaCapabilidade
    ],
    exports: [
        AtualizaCapabilidade,
        ItemService,
        ItemRepository
    ]
})
export class ItemServiceModule { }