import { Inject } from "@nestjs/common";
import { CargoRepository } from "../repository/Cargo.repository";
import { GerenciaCargoRepository } from "../repository/GerenciaCargo.repository";
import { GerenciaCargo } from "../../@core/entities/GerenciaCargo.entity";
import { Cargo } from "../../@core/entities/Cargo.entity";
import { ISetUserCargo } from "../../@core/interfaces/ISetUserCargo";
import { IGetCargo } from "../../@core/interfaces/IGetCargo";
import { IGetUserCargos } from "../../@core/interfaces/IGetUserCargos";
import { CargoEnum } from "../../@core/enum/CARGOS.enum";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";

export class CargoService implements
    ISetUserCargo,
    IGetCargo,
    IGetUserCargos {
        
    constructor(
        @Inject(CargoRepository) private cargoRepository: CargoRepository,
        @Inject(GerenciaCargoRepository) private gerenciaCargoRepository: GerenciaCargoRepository
    ) { }

    async getCargo(cargo: CargoEnum): Promise<Cargo> {
        return await this.cargoRepository.findOneOrFail({
            where: {
                nome: cargo
            }
        })
    }

    async getUserCargos(user: User): Promise<GerenciaCargo[]> {
        try {
            const gerenciaCargo = await this.gerenciaCargoRepository.find({
                where: {
                    user: {
                        id: user.id
                    }
                }
            });
            return gerenciaCargo;
        } catch (error) {
            throw new Error('Problema ao cosultar cargos do usuario');
        }
    }

    async setUserCargo(user: User, cargo: CargoEnum): Promise<GerenciaCargo> {
        try {
            const cargoTarget = await this.getCargo(cargo);
            const gerenciaObject = this.gerenciaCargoRepository.create({
                user: user,
                cargo: cargoTarget
            });
            return await this.gerenciaCargoRepository.save(gerenciaObject);
        } catch (error) {
            throw new Error(`Falha a atribuir cargo para o usuario ${user.name} ${cargo}`)
        }
    }
}