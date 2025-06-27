import { Module } from "@nestjs/common";
import { ProducaoSimulacaoController } from "./controllers/ProducaoSimulacao.controller";
import { ProducaoSimulacaoModule } from "src/modules/producao-simulacao/ProducaoSimulacao.module";
import { PlanejamentoController } from "./controllers/Planejamento.controller";
import { PlanejamentoModule } from "src/modules/planejamento/Planejamento.module";
import { VirtualDateController } from "./controllers/VirtualDate.controller";
import { ReplanejamentoModule } from "src/modules/replanejamento/Replanejamento.module";
import { ReplanejamentoController } from "./controllers/Replanejamento.controller";
import { KpiModule } from "src/modules/kpi/Kpi.module";

@Module({
    imports: [ProducaoSimulacaoModule, KpiModule, PlanejamentoModule, ReplanejamentoModule],
    providers: [],
    controllers: [ProducaoSimulacaoController, ReplanejamentoController, PlanejamentoController, VirtualDateController]
})
export class DeliveryModule { }