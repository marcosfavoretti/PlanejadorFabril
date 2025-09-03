import { Module } from '@nestjs/common';
import { SincronizaProducaoController } from './sincroniza-producao.controller';
import { SincronizaProducaoService } from './sincroniza-producao.service';

@Module({
  imports: [],
  controllers: [SincronizaProducaoController],
  providers: [SincronizaProducaoService],
})
export class SincronizaProducaoModule {}
