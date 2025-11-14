import { User } from '@libs/lib/modules/user/@core/entities/User.entity';
import { GerenciaCargo } from '../entities/GerenciaCargo.entity';
import { Cargo } from '../entities/Cargo.entity';
import { CargoEnum } from '../enum/CARGOS.enum';
export const ISetUserCargo = Symbol('ISetUserCargo');
export interface ISetUserCargo {
  setUserCargo(user: User, cargo: CargoEnum): Promise<GerenciaCargo>;
}
