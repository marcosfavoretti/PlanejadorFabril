import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";
import { FabricaModule } from "@libs/lib/modules/fabrica/Fabrica.module";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { PlanejamentoWorker } from "./application/Planejamento.worker";

@Module({
    imports: [
        TypeormDevConfigModule,
        FabricaModule,
        BullModule.registerQueue({
            defaultJobOptions: {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: true
            },
            name: 'planejamento', // nome da fila
        }),
    ],
    providers: [
        PlanejamentoWorker

    ],
    exports: [
    ],
})
export class AppModule { }