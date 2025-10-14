import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ImportadorDePedidoJob } from "./application/ImportadorJob";
import { EmailService } from "@libs/lib/modules/shared/services/Email.service";
import { PedidoServiceModule } from "@libs/lib/modules/pedido/PedidoService.module";
import { FabricaModule } from "@libs/lib/modules/fabrica/Fabrica.module";
import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";
import { PedidoLogixDAO } from "./infra/service/PedidosLogix.dao";
import { BullModule } from "@nestjs/bull";
import { typeormSynecoConfig } from "@libs/lib/config/TypeormSynecoConfig.module";
import { planejamentoQueue } from "@libs/lib/modules/shared/@core/const/queue";
import { ItemServiceModule } from "@libs/lib/modules/item/ItemService.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PedidoServiceModule,
        ItemServiceModule,
        TypeormDevConfigModule,
        FabricaModule,
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST, // nome do serviço do docker-compose
                port: +process.env.REDIS_PORT!,
            },
        }), 
        BullModule
            .registerQueue({
                name: planejamentoQueue
            }),
        typeormSynecoConfig([])
    ],
    providers: [
        PedidoLogixDAO,
        EmailService,
        ImportadorDePedidoJob
    ],
    exports: [

    ]
})
export class AppModule { }