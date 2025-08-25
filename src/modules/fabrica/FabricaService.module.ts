import { Module } from "@nestjs/common";
import { PlanejamentoRepository } from "../planejamento/infra/repositories/Planejamento.repo";
import { VirtualDateService } from "./infra/service/VirtualDate.service";
import { VirtualDateRepository } from "./infra/repository/VirtualDate.repository";
import { PipeFrabricacaoProvider } from "./PipeFrabricacao.provider";
import { MercadoSnapShotRepository } from "./infra/repository/MercadoSnapShot.repository";
import { MercadoSnapShotService } from "./infra/service/MercadoSnapShot.service";
import { SyncMercadoManual } from "../planejamento/@core/services/SyncMercadoManual";
import { ISyncProducao } from "../planejamento/@core/interfaces/ISyncProducao";
import { GerenciadorPlanejamento } from "./infra/service/GerenciadorPlanejamento";
import { AlocaPorCapabilidade } from "../planejamento/@core/services/AlocaPorCapabilidade";
import { RealocaPorCapabilidade } from "../replanejamento/@core/service/RealocaPorCapabilidade";
import { IGerenciadorPlanejamentoMutation } from "./@core/interfaces/IGerenciadorPlanejamento";
import { IGerenciadorPlanejamentConsulta } from "./@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { TabelaProducaoService } from "../planejamento/infra/services/TabelaProducao.service";
import { TabelaProducaoRepository } from "../planejamento/infra/repositories/TabelaProducao.repository";
import { FabricaService } from "./infra/service/Fabrica.service";
import { FabricaSimulacaoService } from "./infra/service/FabricaSimulacao.service";
import { FabricaRepository } from "./infra/repository/Fabrica.repository";
import { ConsultaPlanejamentoService } from "./infra/service/ConsultaPlanejamentos.service";
import { EfetivaPlanejamentoService } from "./infra/service/EfetivaPlanejamento.service";
import { PlanejamentoSnapShotRepository } from "./infra/repository/PlanejamentoSnapShot.repository";
import { ForkFabricaService } from "./infra/service/ForkFabrica.service";
import { DeletaSnapShotService } from "./infra/service/DeletaSnapShot.service";
import { PlanejamentoCheckPoint } from "./infra/service/PlanejamentoCheckpoint.service";
import { IGeraCheckPoint } from "./@core/interfaces/IGeraCheckPoint";
import { DividaService } from "./infra/service/Divida.service";
import { DividaRepository } from "./infra/repository/Divida.repository";
import { ValidaCapacidade } from "./@core/services/ValidaCapacidade";
import { PlanejamentoValidatorExecutorService } from "./@core/services/PlanejamentoValidatorExecutor.service";
import { IValidaPlanejamento } from "./@core/interfaces/IValidaPlanejamento";
import { ValidaData } from "./@core/services/ValidaData";
import { SetorFabricaProviders } from "./SetorFabrica.provider";
import { DividaSnapShotRepository } from "./infra/repository/DividaSnapShot.repository";
import { GerenciaDividaService } from "./infra/service/GerenciaDivida.service";
import { AlocaPorBatelada } from "../planejamento/@core/services/AlocaPorBatelada";
import { DividaCheckPoint } from "./infra/service/DividaCheckpoint.service";
import { SetorChainFactoryService } from "./@core/services/SetorChainFactory.service";
import { PlanejamentoServiceModule } from "../planejamento/PlanejamentoService.module";
import { ApagaPedidoPlanejadoService } from "./infra/service/ApagaPedidoPlanejado.service";
import { ReplanejarPedidoUseCase } from "./application";
import { PedidoServiceModule } from "../pedido/PedidoService.module";
import { IConverteItem } from "../item/@core/interfaces/IConverteItem";
import { ItemServiceModule } from "../item/ItemService.module";
import { IConsultaRoteiro } from "./@core/interfaces/IConsultaRoteiro";
import { EstruturaNeo4jApiService } from "./infra/service/EstruturaNeo4jApi.service";
import { IConsultarRoteiroPrincipal } from "./@core/interfaces/IConsultarRoteiroPrincipal";
import { RoteiroPrincipal } from "./infra/service/RoteiroPrinciapal.service";
import { IBuscarItemDependecias } from "../item/@core/interfaces/IBuscarItemDependecias";

@Module({
    imports: [
        PlanejamentoServiceModule,
        PedidoServiceModule,
        ItemServiceModule,
    ],
    providers: [
        ...SetorFabricaProviders,
        RealocaPorCapabilidade,
        AlocaPorBatelada,
        AlocaPorCapabilidade,
        DividaService,
        DividaRepository,
        MercadoSnapShotRepository,
        VirtualDateRepository,
        VirtualDateService,
        MercadoSnapShotService,
        TabelaProducaoService,
        DeletaSnapShotService,
        PlanejamentoRepository,
        PipeFrabricacaoProvider,
        ApagaPedidoPlanejadoService,
        SetorChainFactoryService,
        ValidaCapacidade,
        DividaCheckPoint,
        PlanejamentoValidatorExecutorService,
        ValidaData,
        {
            provide: IConsultaRoteiro,
            useClass: EstruturaNeo4jApiService
        },
        {
            provide:IBuscarItemDependecias,
            useClass: EstruturaNeo4jApiService
        },
        {
            provide: IConsultarRoteiroPrincipal,
            useClass: RoteiroPrincipal
        },
        {
            provide: IConverteItem,
            useClass: EstruturaNeo4jApiService
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
        {
            provide: IValidaPlanejamento,
            useFactory: (
                //   validaCapacidade: IValidaPlanejamento,
                validaData: IValidaPlanejamento
            ) => [

                    //validaCapacidade,
                    validaData
                ],
            inject: [
                //    ValidaCapacidade,
                ValidaData
            ]
        },
        {
            provide: 'CHECKPOINT_SERVICES',
            useFactory: (planejamentoCheckPoint: IGeraCheckPoint, dividaCheckPoint: IGeraCheckPoint) => [planejamentoCheckPoint, dividaCheckPoint],
            inject: [PlanejamentoCheckPoint, DividaCheckPoint],
        },
        PlanejamentoCheckPoint,
        FabricaService,
        ForkFabricaService,
        FabricaRepository,
        ConsultaPlanejamentoService,
        TabelaProducaoRepository,
        FabricaSimulacaoService,
        EfetivaPlanejamentoService,
        PlanejamentoSnapShotRepository,
        MercadoSnapShotService,
        GerenciaDividaService,
        DividaSnapShotRepository,
        ReplanejarPedidoUseCase,
    ],
    exports: [
        GerenciaDividaService,
        ReplanejarPedidoUseCase,
        IConverteItem,
        DividaSnapShotRepository,
        DividaService,
        RealocaPorCapabilidade,
        DividaRepository,
        ApagaPedidoPlanejadoService,
        PlanejamentoCheckPoint,
        "CHECKPOINT_SERVICES",
        ForkFabricaService,
        MercadoSnapShotService,
        PlanejamentoSnapShotRepository,
        SetorChainFactoryService,
        DeletaSnapShotService,
        EfetivaPlanejamentoService,
        ConsultaPlanejamentoService,
        FabricaRepository,
        FabricaSimulacaoService,
        FabricaService,
        TabelaProducaoRepository,
        TabelaProducaoService,
        IGerenciadorPlanejamentConsulta,
        ISyncProducao,
        IGerenciadorPlanejamentoMutation,
        FabricaService,
        MercadoSnapShotRepository,
        VirtualDateRepository,
        VirtualDateService,
        MercadoSnapShotService,
        PlanejamentoRepository,
        PipeFrabricacaoProvider,
    ]
})
export class FabricaServiceModule { }
