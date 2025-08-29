import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserService } from "./infra/services/User.service";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User
        ]),
    ],
    providers: [
        {
            provide: IUserService,
            useClass: UserService
        }
    ],
    exports: [IUserService]
})
export class UserServiceModule { }