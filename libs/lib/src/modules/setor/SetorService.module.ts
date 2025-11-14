import { Module } from '@nestjs/common';
import { SetorRepository } from './infra/repository/Setor.repository';
import { SetorService } from './infra/service/Setor.service';

@Module({
  imports: [],
  providers: [SetorRepository, SetorService],
  exports: [SetorRepository, SetorService],
})
export class SetorServiceModule {}
