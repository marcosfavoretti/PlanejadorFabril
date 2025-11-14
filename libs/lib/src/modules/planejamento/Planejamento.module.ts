import { Module } from '@nestjs/common';
import { ConsultarDatasPlanejadasUseCase } from '../fabrica/application/ConsultarDatasPlanejadas.usecase';
import { PlanejamentoServiceModule } from './PlanejamentoService.module';
import { ConsultaTabelaDiariaUseCase } from './application/ConsultaTabelaDiaria.usecase';
import { SaveTabelaDiarioUseCase } from './application/SaveTabelaDiario.usecase';

@Module({
  imports: [PlanejamentoServiceModule],
  providers: [ConsultaTabelaDiariaUseCase, SaveTabelaDiarioUseCase],
  exports: [SaveTabelaDiarioUseCase, ConsultaTabelaDiariaUseCase],
})
export class PlanejamentoModule {}
