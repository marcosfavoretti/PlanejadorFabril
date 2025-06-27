import { Module } from "@nestjs/common";
import { SetorSolda } from "../planejamento/@core/services/SetorSolda";
import { SetorLixa } from "../planejamento/@core/services/SetorLixa";
import { SetorBanho } from "../planejamento/@core/services/SetorBanho";
import { SetorPinturaLiq } from "../planejamento/@core/services/SetorPinturaliq";
import { SetorMontagem } from "../planejamento/@core/services/SetorMontagem";
import { PipeFrabricacaoProvider } from "../planejamento/PipeFrabricacao.provider";
import { SyncMercadoManual } from "../planejamento/@core/services/SyncMercadoManual";
import { ISyncProducao } from "../planejamento/@core/interfaces/ISyncProducao";
import { GerenciadorPlanejamento } from "../planejamento/@core/entities/GerenciadorPlanejamento";
import { FabricaService } from "../planejamento/@core/services/Fabrica.service";
import { PlanejamentoDiarioRepository } from "../planejamento/infra/repositories/PlanejamentoDiario.repo";
import { PlanejamentoRepository } from "../planejamento/infra/repositories/Planejamento.repo";
import { TabelaProducaoService } from "../producao-simulacao/infra/services/TabelaProducao.service";
import { VirtualDateService } from "../producao-simulacao/infra/services/VirtualDate.service";
import { VirtualDateRepository } from "../producao-simulacao/infra/repositories/VirtualDate.repository";
import { TabelaProducaoRepository } from "../producao-simulacao/infra/repositories/TabelaProducao.repository";
import { MercadoLogStoreService } from "../planejamento/@core/services/MercadoLogStore.service";
import { MetodoDeAlocacao } from "../planejamento/@core/abstract/MetodoDeAlocacao";
import { AlocaPorCapabilidade } from "../planejamento/@core/services/AlocaPorCapabilidade";
import { MetodoDeReAlocacao } from "../replanejamento/@core/abstract/MetodoDeReAlocacao";
import { RealocaPorCapabilidade } from "../replanejamento/@core/service/RealocaPorCapabilidade";
import { IGerenciadorPlanejamentoMutation } from "../planejamento/@core/interfaces/IGerenciadorPlanejamento";
import { IGerenciadorPlanejamentConsulta } from "../planejamento/@core/interfaces/IGerenciadorPlanejamentoConsulta";

@Module({
    imports: [

    ],
    providers: [
        GerenciadorPlanejamento,
        TabelaProducaoRepository,
        TabelaProducaoService,
        VirtualDateRepository,
        VirtualDateService,
        MercadoLogStoreService,
        SetorSolda,
        SetorLixa,
        SetorBanho,
        SetorPinturaLiq,
        SetorMontagem,
        PlanejamentoRepository,
        PlanejamentoDiarioRepository,
        PipeFrabricacaoProvider,
        {
            provide: MetodoDeReAlocacao,
            useClass: RealocaPorCapabilidade
        },
        {
            provide: MetodoDeAlocacao,
            useClass: AlocaPorCapabilidade
        },
        {
            provide: IGerenciadorPlanejamentConsulta,
            useClass: GerenciadorPlanejamento
        },
        {
            provide: IGerenciadorPlanejamentoMutation,
            useClass: GerenciadorPlanejamento
        },
        {
            provide: ISyncProducao,
            useClass: SyncMercadoManual
        },
        FabricaService
    ],
    exports: [FabricaService, MercadoLogStoreService],
})
export class FabricaModule { }