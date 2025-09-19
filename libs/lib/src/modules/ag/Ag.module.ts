import { Module } from "@nestjs/common";
import { FabricaServiceModule } from "@libs/lib/modules/fabrica/FabricaService.module";
import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";
import { AgPlanejamentoOptimizer } from "./application/AgPlanejamentoOptimizer.usecase";

@Module({
    imports: [
        TypeormDevConfigModule,
        FabricaServiceModule,
    ],
    providers: [
        AgPlanejamentoOptimizer,
    ],
    exports: [
        AgPlanejamentoOptimizer
    ]
})
export class AgModule { }