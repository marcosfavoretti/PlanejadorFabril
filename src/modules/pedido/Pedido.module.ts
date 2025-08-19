import { Module } from "@nestjs/common";
import { PedidoServiceModule } from "./PedidoService.module";
import { ConsultarPedidosUseCase } from "./application/ConsultarPedidos.usecase";

@Module({
    imports: [
        PedidoServiceModule
    ],
    providers: [
        ConsultarPedidosUseCase
    ],
    exports: [
        ConsultarPedidosUseCase
    ]
})
export class PedidoModule { }