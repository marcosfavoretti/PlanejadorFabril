import { Module } from "@nestjs/common";
import { TabelaProducaoRepository } from "./infra/repositories/TabelaProducao.repository";
import { SaveTabelaDiarioUseCase } from "./application/SaveTabelaDiario.usecase";
import { ConsultaTabelaDiariaUseCase } from "./application/ConsultaTabelaDiaria.usecase";
import { TabelaProducaoService } from "./infra/services/TabelaProducao.service";
import { VirtualDateService } from "./infra/services/VirtualDate.service";
import { VirtualDateRepository } from "./infra/repositories/VirtualDate.repository";
import { ConsultarDateVirtualUseCase } from "./application/ConsultarDataVirutal.usecase";
import { HandleDateVirtualUseCase } from "./application/HandleDataVirtual.usecase";
import { FabricaModule } from "../fabrica/Fabrica.module";

@Module({
    imports: [FabricaModule],
    providers: [
        HandleDateVirtualUseCase,
        ConsultarDateVirtualUseCase,
        ConsultaTabelaDiariaUseCase,
        VirtualDateService,
        VirtualDateRepository,
        TabelaProducaoRepository,
        TabelaProducaoService,
        SaveTabelaDiarioUseCase],
    exports: [
        HandleDateVirtualUseCase,
        ConsultarDateVirtualUseCase,
        ConsultaTabelaDiariaUseCase,
        SaveTabelaDiarioUseCase,
    ]
})
export class ProducaoSimulacaoModule { }