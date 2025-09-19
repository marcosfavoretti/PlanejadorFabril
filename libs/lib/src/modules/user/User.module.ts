import { Module } from "@nestjs/common";
import { UserUsecase } from "./application/User.usecase";
import { UserServiceModule } from "./UserService.module";
import { CargosServiceModule } from "../cargos/CargoService.module";

@Module({
    imports: [
        UserServiceModule,
        CargosServiceModule
    ],
    providers: [UserUsecase],
    exports: [UserUsecase],
})
export class UserModule { }