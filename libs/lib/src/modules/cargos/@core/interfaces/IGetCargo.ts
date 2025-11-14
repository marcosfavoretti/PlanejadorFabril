import { Cargo } from '../entities/Cargo.entity';
import { CargoEnum } from '../enum/CARGOS.enum';
export const IGetCargo = Symbol('IGetCargo');
export interface IGetCargo {
  getCargo(cargo: CargoEnum): Promise<Cargo>;
}
