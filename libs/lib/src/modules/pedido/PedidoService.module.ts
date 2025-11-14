import { Module } from '@nestjs/common';
import { PedidoRepository } from './infra/repositories/Pedido.repository';
import { PedidoService } from './infra/service/Pedido.service';

@Module({
  imports: [],
  providers: [PedidoRepository, PedidoService],
  exports: [PedidoService],
})
export class PedidoServiceModule {}
