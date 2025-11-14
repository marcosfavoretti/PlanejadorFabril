import { Module } from '@nestjs/common';
import { AgOptimizerUseCase } from './application/AgOptimizer.usecase';
import { FabricaServiceModule } from '@libs/lib/modules/fabrica/FabricaService.module';
import { TypeormDevConfigModule } from '@libs/lib/config/TypeormDevConfig.module';

@Module({
  imports: [TypeormDevConfigModule, FabricaServiceModule],
  providers: [AgOptimizerUseCase],
  exports: [AgOptimizerUseCase],
})
export class AgModule {}
