import { Module } from "@nestjs/common";
import { FabricaModule } from "../fabrica/Fabrica.module";
import { TabelaProducaoService } from "../planejamento/infra/services/TabelaProducao.service";
import { ConsultarGraficoGanttUseCase } from "./application/ConsultarGraficoGantt.usecase";
import { ConsultarMercadoUseCase } from "./application/ConsultarMercado.usecase";
import { LinkMercadoComProdService } from "./infra/services/LinkMercadoComProd.service";
import { FabricaServiceModule } from "../fabrica/FabricaService.module";
import { ColorGenerator } from "../shared/@core/classes/GeradorDeCor";

@Module({
    imports: [FabricaServiceModule],
    providers: [
        TabelaProducaoService,
        LinkMercadoComProdService,
        ColorGenerator,
        ConsultarGraficoGanttUseCase,
        ConsultarMercadoUseCase,
    ],
    exports: [
        ConsultarGraficoGanttUseCase,
        ConsultarMercadoUseCase
    ],
})
export class KpiModule { }