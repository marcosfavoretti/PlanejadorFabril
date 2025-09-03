import { Inject } from "@nestjs/common";
import { IGetCargo } from "../../@core/interfaces/IGetCargo";
import { CargoRepository } from "../repository/Cargo.repository";
import { Cargo } from "../../@core/entities/Cargo.entity";
import { CargoEnum } from "../../@core/enum/CARGOS.enum";

export class CargoService implements IGetCargo {
    constructor(
        @Inject(CargoRepository) private cargoRepository: CargoRepository
    ) { }

    /**
     * @param cargo 
     * @description procura o cargo por enum, se nao achar joga exceo entityNotFound
     * @returns 
     */
    async get(cargo: CargoEnum): Promise<Cargo> {
        return await this.cargoRepository.findOneOrFail({
            where: {
                nome: cargo
            }
        })
    }
}