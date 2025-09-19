import { SetUserCargoDTO } from "@dto/SetUserCargo.dto";
import { GerenciaCargo } from "@libs/lib/modules/cargos/@core/entities/GerenciaCargo.entity";
import { SetUseCargoUseCase } from "@libs/lib/modules/cargos/application/SetUserCargo.usecase";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('User')
@Controller('/user/cargo')
export class CargoController {
    @Inject(SetUseCargoUseCase) private setUseCargoUseCase: SetUseCargoUseCase
    @Post('/')
    public async setUserCargoMethod(
        @Body() payload: SetUserCargoDTO
    ): Promise<GerenciaCargo> {
        return await this.setUseCargoUseCase.set(payload)
    }
}