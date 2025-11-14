import { Module } from '@nestjs/common';
import { MercadoRepository } from './infra/Mercados.repository';

@Module({
  imports: [],
  providers: [MercadoRepository],
  exports: [MercadoRepository],
})
export class MercadoServiceModule {}
