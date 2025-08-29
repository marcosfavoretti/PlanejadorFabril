import { IAutentication } from "../../@core/abstract/IAutentication";
import { User } from "../../@core/entities/User.entity";
import { Repository } from "typeorm";
import { UserNotFoundException } from "../../@core/exceptions/UserNotFound.exception";

export class AutenticationService implements IAutentication {
    constructor(private userRepo: Repository<User>) { }
    async auth(username: string, password: string): Promise<User> {
        const targetUser = await this.userRepo.findOne({
            where: {
                name: username,
                password: password
            }
        });
        if(!targetUser) throw new UserNotFoundException();
        return targetUser;
    }

    async authWeakness(userName: string): Promise<User> {
        const targetUser = await this.userRepo.findOne({
            where: {
                name: userName,
                password: 'guest'
            }
        })
        if (!targetUser) throw new UserNotFoundException();
        return targetUser;
    }
}