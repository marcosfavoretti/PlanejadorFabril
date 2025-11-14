import { Module } from '@nestjs/common';
import { VirtualDateService } from '../fabrica/infra/service/VirtualDate.service';
import { VirtualDateRepository } from '../fabrica/infra/repository/VirtualDate.repository';
import { FabricaServiceModule } from '../fabrica/FabricaService.module';

@Module({
  imports: [FabricaServiceModule],
  providers: [VirtualDateService, VirtualDateRepository],
  exports: [],
})
export class ReplanejamentoModule {}
