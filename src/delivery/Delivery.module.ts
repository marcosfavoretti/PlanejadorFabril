
import { Module } from "@nestjs/common";
import { ProducaoSimulacaoController } from "./controllers/ProducaoSimulacao.controller";
import { PlanejamentoController } from "./controllers/Planejamento.controller";
import { PlanejamentoModule } from "src/modules/planejamento/Planejamento.module";
import { VirtualDateController } from "./controllers/VirtualDate.controller";
import { ReplanejamentoModule } from "src/modules/replanejamento/Replanejamento.module";
import { ReplanejamentoController } from "./controllers/Replanejamento.controller";
import { KpiModule } from "src/modules/kpi/Kpi.module";
import { UserController } from "./controllers/User.controller";
import { UserModule } from "src/modules/user/User.module";
import { UserServiceModule } from "src/modules/user/UserService.module";
import { FabricaModule } from "src/modules/fabrica/Fabrica.module";
import { FabricaController } from "./controllers/Fabrica.controller";
import { PedidoController } from "./controllers/Pedido.controller";
import { PedidoModule } from "src/modules/pedido/Pedido.module";
import { KPIController } from "./controllers/Kpi.controller";
import { ItemController } from "./controllers/Item.controller";
import { ItemModule } from "src/modules/item/Item.module";
import { DonoDaFabricaGuard } from "src/modules/fabrica/@core/guard/dono-da-fabrica.guard";
import { FabricaServiceModule } from "src/modules/fabrica/FabricaService.module";

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