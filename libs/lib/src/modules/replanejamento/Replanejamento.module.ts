import { Module } from "@nestjs/common";
import { VirtualDateService } from "../fabrica/infra/service/VirtualDate.service";
import { ReplanejamentoUseCase } from "./application/Replanejamento.usecase";
import { FabricaModule } from "../fabrica/Fabrica.module";
import { VirtualDateRepository } from "../fabrica/infra/repository/VirtualDate.repository";
import { FabricaServiceModule } from "../fabrica/FabricaService.module";


@Module({
    imports: [
        FabricaServiceModule
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