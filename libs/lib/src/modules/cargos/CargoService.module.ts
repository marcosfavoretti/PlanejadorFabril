import { Module } from '@nestjs/common';
import { CargoService } from './infra/service/Cargo.service';
import { GerenciaCargoRepository } from './infra/repository/GerenciaCargo.repository';
import { CargoRepository } from './infra/repository/Cargo.repository';
import { ISetUserCargo } from './@core/interfaces/ISetUserCargo';
import { IGetUserCargos } from './@core/interfaces/IGetUserCargos';
import { IGetCargo } from './@core/interfaces/IGetCargo';

@Module({
  imports: [],
  providers: [
    GerenciaCargoRepository,
    CargoRepository,
    {
      provide: ISetUserCargo,
      useClass: CargoService,
    },
    {
      provide: IGetUserCargos,
      useClass: CargoService,
    },
    {
      provide: IGetCargo,
      useClass: CargoService,
    },
  ],
  exports: [
    IGetCargo,
    IGetUserCargos,
    ISetUserCargo,
    GerenciaCargoRepository,
    CargoRepository,
  ],
})
export class CargosServiceModule {}
