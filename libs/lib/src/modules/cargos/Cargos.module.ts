import { Module } from "@nestjs/common";
import { CargosServiceModule } from "./CargoService.module";
import { SetUseCargoUseCase } from "./application/SetUserCargo.usecase";
import { UserServiceModule } from "../user/UserService.module";

@Module({
    imports: [
        UserServiceModule,
        CargosServiceModule
    ],
    providers: [
        SetUseCargoUseCase
    ],
    exports: [
        SetUseCargoUseCase
    ]
})
export class CargosModule { }