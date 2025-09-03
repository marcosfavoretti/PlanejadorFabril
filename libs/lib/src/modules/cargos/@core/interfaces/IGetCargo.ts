import { Cargo } from "../entities/Cargo.entity";
import { CargoEnum } from "../enum/CARGOS.enum";

export interface IGetCargo {
    get(cargo: CargoEnum):Promise<Cargo>;
}