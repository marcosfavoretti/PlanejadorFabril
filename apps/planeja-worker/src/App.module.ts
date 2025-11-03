import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";
import { FabricaModule } from "@libs/lib/modules/fabrica/Fabrica.module";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { PlanejamentoWorker } from "./application/Planejamento.worker";
import { PedidoServiceModule } from "@libs/lib/modules/pedido/PedidoService.module";

@Module({
    imports: [
        TypeormDevConfigModule,
        FabricaModule,
        BullModule
            .registerQueue({
                redis: {
                    host: process.env.REDIS_HOST, // nome do serviço do docker-compose
                    port: +process.env.REDIS_PORT!,
                },
                defaultJobOptions: {
                    attempts: 3,
                    removeOnComplete: true,
                    removeOnFail: true
                },
                name: 'planejamento',
            }),
            PedidoServiceModule
    ],
    providers: [
        PlanejamentoWorker
    ],
    exports: [
    ],
})
export class AppModule { }