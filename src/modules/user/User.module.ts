import { Module } from "@nestjs/common";
import { UserController } from "../../delivery/controllers/User.controller";
import { UserUsecase } from "./application/User.usecase";
import { UserServiceModule } from "./UserService.module";

@Module({
    imports: [
        UserServiceModule,
    ],
    providers: [UserUsecase],
    exports: [UserUsecase],
})
export class UserModule { }