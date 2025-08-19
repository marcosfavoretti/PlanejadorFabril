import { Module } from "@nestjs/common";
import { PlanejamentoServiceModule } from "../planejamento/PlanejamentoService.module";
import { PedidoServiceModule } from "../pedido/PedidoService.module";
import { FabricaServiceModule } from "./FabricaService.module";
import { UserServiceModule } from "../user/UserService.module";
import {
    ConsultarDatasPlanejadasUseCase,
    AtualizarPlanejamentoUseCase,
    ConsultarDateVirtualUseCase,
    ConsultarFabricaUseCase,
    ConsultarPlanejamentosUseCase,
    ConsultarPedidosPlanejadosUseCase,
    ConsultartPedidoUseCase,
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
import { ItemServiceModule } from "../item/ItemService.module";

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