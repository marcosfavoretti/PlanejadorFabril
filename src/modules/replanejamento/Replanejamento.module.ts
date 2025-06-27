import { Module } from "@nestjs/common";
import { VirtualDateService } from "../producao-simulacao/infra/services/VirtualDate.service";
import { ReplanejamentoUseCase } from "./application/Replanejamento.usecase";
import { VirtualDateRepository } from "../producao-simulacao/infra/repositories/VirtualDate.repository";
import { FabricaModule } from "../fabrica/Fabrica.module";


@Module({
    imports: [
        FabricaModule
    ],
    providers: [
        VirtualDateService,
        VirtualDateRepository,
        ReplanejamentoUseCase
    ],
    exports: [ReplanejamentoUseCase]
})
export class ReplanejamentoModule {

}