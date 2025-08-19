import { Module } from "@nestjs/common";
import { SetorServiceModule } from "../setor/SetorService.module";
import { ItemServiceModule } from "./ItemService.module";
import { ConsultarItemCapabilidadeTabelaUseCase } from "./application/ConsultarItemCapabilidadeTabela.usecase";
import { CadastrarItemCapabilidadeUseCase } from "./application/CadastrarCapabilidade.usecase";

@Module({
    imports: [
        ItemServiceModule,
        SetorServiceModule,
    ],
    providers: [
        CadastrarItemCapabilidadeUseCase,
        ConsultarItemCapabilidadeTabelaUseCase
    ],
    exports: [
        CadastrarItemCapabilidadeUseCase,
        ConsultarItemCapabilidadeTabelaUseCase
    ]
})
export class ItemModule { }