import { Inject } from "@nestjs/common";
import { GerenciaCargoRepository } from "../repository/GerenciaCargo.repository";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { GerenciaCargo } from "../../@core/entities/GerenciaCargo.entity";
import { ISetUserCargo } from "../../@core/interfaces/ISetUserCargo";
import { Cargo } from "../../@core/entities/Cargo.entity";
import { IGetUserCargos } from "../../@core/interfaces/IGetUserCargos";

export class GerenciaCargoService
    implements
    ISetUserCargo,
    IGetUserCargos {

    constructor(
        @Inject(GerenciaCargoRepository) private gerenciaCargoRepository: GerenciaCargoRepository
    ) { }

    async get(user: User): Promise<GerenciaCargo[]> {
        const cargos = await this.gerenciaCargoRepository.find({
            where: {
                user: user
            }
        });
        return cargos;
    }

    async set(user: User, cargo: Cargo): Promise<GerenciaCargo> {
        const obj2save = this.gerenciaCargoRepository.create({
            cargo: cargo,
            user: user
        });
        return await this.gerenciaCargoRepository
            .save(obj2save);
    }
}