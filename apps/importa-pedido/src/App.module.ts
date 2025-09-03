import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ImportadorDePedidoJob } from "./application/ImportadorJob";
import { EmailService } from "@libs/lib/modules/shared/services/Email.service";
import { PedidoServiceModule } from "@libs/lib/modules/pedido/PedidoService.module";
import { FabricaModule } from "@libs/lib/modules/fabrica/Fabrica.module";
import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";
import { PedidoLogixDAO } from "./infra/service/PedidosLogix.dao";
import { typeormSynecoConfig } from "@libs/lib/config/TypeormSynecoConfig.module";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        PedidoServiceModule,
        TypeormDevConfigModule,
        typeormSynecoConfig([]),
        FabricaModule,
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