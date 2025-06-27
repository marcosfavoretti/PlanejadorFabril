import { Module } from "@nestjs/common";
import { FabricaModule } from "../fabrica/Fabrica.module";
import { TabelaProducaoService } from "../producao-simulacao/infra/services/TabelaProducao.service";
import { TabelaProducaoRepository } from "../producao-simulacao/infra/repositories/TabelaProducao.repository";
import { ConsultarGraficoGanttUseCase } from "./application/ConsultarGraficoGantt.usecase";
import { ConsultarMercadoUseCase } from "./application/ConsultarMercado.usecase";
import { LinkMercadoComProdService } from "./infra/services/LinkMercadoComProd.service";

@Module({
    imports: [FabricaModule],
    providers: [ TabelaProducaoService,LinkMercadoComProdService, ConsultarGraficoGanttUseCase, ConsultarMercadoUseCase, TabelaProducaoService, TabelaProducaoRepository],
    exports: [ConsultarGraficoGanttUseCase, ConsultarMercadoUseCase],
})
export class KpiModule { }