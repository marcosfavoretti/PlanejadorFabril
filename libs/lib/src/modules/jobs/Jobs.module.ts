import { Module } from "@nestjs/common";
import { PedidoLogixDAO } from "./@infra/DAO/PedidosLogix.dao";
import { ImportadorDePedidosUseCase } from "./application/ImportadorDePedidos.usecase";
import { PedidoServiceModule } from "../pedido/PedidoService.module";
import { FabricaModule } from "../fabrica/Fabrica.module";
import { TypeormDevConfigModule } from "@libs/lib/config/TypeormDevConfig.module";

@Module({
    imports: [
        TypeormDevConfigModule,
        PedidoServiceModule,
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