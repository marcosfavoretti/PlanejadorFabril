import { Inject, InternalServerErrorException } from "@nestjs/common";
import { IGetCargo } from "../@core/interfaces/IGetCargo";
import { ISetUserCargo } from "../@core/interfaces/ISetUserCargo";
import { GerenciaCargo } from "../@core/entities/GerenciaCargo.entity";
import { SetUserCargoDTO } from "@dto/SetUserCargo.dto";
import { IUserService } from "../../user/@core/abstract/IUserService";

export class SetUseCargoUseCase {
    constructor(
        @Inject(IUserService) private userService: IUserService,
        @Inject(IGetCargo) private getCargoService: IGetCargo,
        @Inject(ISetUserCargo) private setUserCargoService: ISetUserCargo
    ) { }

    async set(dto: SetUserCargoDTO): Promise<GerenciaCargo> {
        try {
            const targetCargo = await this.getCargoService.getCargo(dto.cargo);
            const user = await this.userService.getUser(dto.userId);
            return await this.setUserCargoService.setUserCargo(
                user,
                dto.cargo
            );
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}