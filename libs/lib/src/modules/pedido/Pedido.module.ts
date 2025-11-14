import { Module } from '@nestjs/common';
import { PedidoServiceModule } from './PedidoService.module';
import { ConsultarPedidosUseCase } from './application/ConsultarPedidos.usecase';
import { ConsultaItensDoPedidoUseCase } from './application/ConsultaItensDoPedido.usecase';
import { ItemServiceModule } from '../item/ItemService.module';

@Module({
  imports: [ItemServiceModule, PedidoServiceModule],
  providers: [ConsultaItensDoPedidoUseCase, ConsultarPedidosUseCase],
  exports: [ConsultaItensDoPedidoUseCase, ConsultarPedidosUseCase],
})
export class PedidoModule {}
