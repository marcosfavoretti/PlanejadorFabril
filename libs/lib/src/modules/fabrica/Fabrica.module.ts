import { Module } from "@nestjs/common";
import { PlanejamentoServiceModule } from "../planejamento/PlanejamentoService.module";
import { PedidoServiceModule } from "../pedido/PedidoService.module";
import { FabricaServiceModule } from "./FabricaService.module";
import { UserServiceModule } from "../user/UserService.module";
import { ItemServiceModule } from "../item/ItemService.module";

import {
    DesplanejarPedidoUseCase,
    ConsultarDatasPlanejadasUseCase,
    AtualizarPlanejamentoUseCase,
    ConsultarDateVirtualUseCase,
    ConsultarFabricaUseCase,
    ConsultarPlanejamentosUseCase,
    ConsultarPedidosPlanejadosUseCase,
    ConsutlarFabricaPrincipalAtualUseCase,
    ConsutlarFabricasDoUsuarioUseCase,
    CriarNovaFabricaPrincipalUseCase,
    HandleDateVirtualUseCase,
    HandleStartUpBuildFabricaUseCase,
    RequestFabricaForkUseCase,
    PlanejarPedidoUseCase,
    MergeFabricaUseCase,
    AdicionarPlanejamentoManualUseCase,
    ResetaFabricaUseCase,
    RemoverPlanejamentoUseCase,
    DeletarFabricaUseCase
} from "./application";


@Module({
    imports: [
        ItemServiceModule,
        PedidoServiceModule,
        UserServiceModule,
        FabricaServiceModule,
        PlanejamentoServiceModule,
        PedidoServiceModule,
    ],
    providers: [
        DesplanejarPedidoUseCase,
        AtualizarPlanejamentoUseCase,
        HandleStartUpBuildFabricaUseCase,
        AdicionarPlanejamentoManualUseCase,
        HandleDateVirtualUseCase,
        ConsultarDateVirtualUseCase,
        ConsultarDatasPlanejadasUseCase,
        CriarNovaFabricaPrincipalUseCase,
        PlanejarPedidoUseCase,
        ConsutlarFabricaPrincipalAtualUseCase,
        RequestFabricaForkUseCase,
        ConsutlarFabricasDoUsuarioUseCase,
        ConsultarPlanejamentosUseCase,
        ConsultarFabricaUseCase,
        ConsultarPedidosPlanejadosUseCase,
        ResetaFabricaUseCase,
        MergeFabricaUseCase,
        DeletarFabricaUseCase,
        RemoverPlanejamentoUseCase,
    ],
    exports: [
        DesplanejarPedidoUseCase,
        RemoverPlanejamentoUseCase,
        DeletarFabricaUseCase,
        MergeFabricaUseCase,
        ResetaFabricaUseCase,
        ConsultarFabricaUseCase,
        AtualizarPlanejamentoUseCase,
        ConsutlarFabricasDoUsuarioUseCase,
        ConsultarPlanejamentosUseCase,
        ConsultarPedidosPlanejadosUseCase,
        RequestFabricaForkUseCase,
        AdicionarPlanejamentoManualUseCase,
        ConsutlarFabricaPrincipalAtualUseCase,
        CriarNovaFabricaPrincipalUseCase,
        ConsultarDatasPlanejadasUseCase,
        HandleStartUpBuildFabricaUseCase,
        ConsultarDateVirtualUseCase,
        HandleDateVirtualUseCase,
        PlanejarPedidoUseCase,
    ],
})
export class FabricaModule { }