
import { Module } from "@nestjs/common";
import { ProducaoSimulacaoController } from "./controllers/ProducaoSimulacao.controller";
import { PlanejamentoController } from "./controllers/Planejamento.controller";
import { PlanejamentoModule } from "@libs/lib/modules/planejamento/Planejamento.module";
import { VirtualDateController } from "./controllers/VirtualDate.controller";
import { ReplanejamentoModule } from "@libs/lib/modules/replanejamento/Replanejamento.module";
import { ReplanejamentoController } from "./controllers/Replanejamento.controller";
import { KpiModule } from "@libs/lib/modules/kpi/Kpi.module";
import { UserController } from "./controllers/User.controller";
import { UserModule } from "@libs/lib/modules/user/User.module";
import { UserServiceModule } from "@libs/lib/modules/user/UserService.module";
import { FabricaModule } from "@libs/lib/modules/fabrica/Fabrica.module";
import { FabricaController } from "./controllers/Fabrica.controller";
import { PedidoController } from "./controllers/Pedido.controller";
import { PedidoModule } from "@libs/lib/modules/pedido/Pedido.module";
import { KPIController } from "./controllers/Kpi.controller";
import { ItemController } from "./controllers/Item.controller";
import { ItemModule } from "@libs/lib/modules/item/Item.module";
import { DonoDaFabricaGuard } from "@libs/lib/modules/fabrica/@core/guard/dono-da-fabrica.guard";
import { FabricaServiceModule } from "@libs/lib/modules/fabrica/FabricaService.module";

@Module({
    imports: [
        FabricaModule,
        UserModule,
        UserServiceModule,
        KpiModule,
        PlanejamentoModule,
        ReplanejamentoModule,
        PedidoModule,
        ItemModule,
        //services para guards
        FabricaServiceModule,
    ],
    providers: [
        DonoDaFabricaGuard,
    ],
    controllers: [
        ItemController,
        KPIController,
        PedidoController,
        FabricaController,
        UserController,
        ProducaoSimulacaoController,
        ReplanejamentoController,
        PlanejamentoController,
        VirtualDateController
    ]
})
export class DeliveryModule { }