import { Module } from "@nestjs/common";
import { PedidoLogixDAO } from "./@infra/DAO/PedidosLogix.dao";
import { ScheduleModule } from "@nestjs/schedule";
import { ImportadorDePedidosUseCase } from "./application/ImportadorDePedidos.usecase";
import { PedidoServiceModule } from "../pedido/PedidoService.module";
import { FabricaModule } from "../fabrica/Fabrica.module";

@Module({
    imports: [
        PedidoServiceModule,
        ScheduleModule.forRoot(),
        FabricaModule
    ],
    providers: [
        ImportadorDePedidosUseCase,
        PedidoLogixDAO
    ],
    exports: [
        ImportadorDePedidosUseCase
    ]
})
export class JobsModule { }