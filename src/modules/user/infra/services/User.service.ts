import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../@core/entities/User.entity";
import { IUserRepository } from "../../@core/abstract/IUserRepository";
import { IUserService } from "../../@core/abstract/IUserService";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserNotFoundException } from "../../@core/exceptions/UserNotFound.exception";
import { AutenticationService } from "./Autentication.service";
import { IAutentication } from "../../@core/abstract/IAutentication";
import { AuthDto } from "../../../../delivery/dtos/Auth.dto";

@Injectable()
export class UserService implements IUserService {
    private authService: IAutentication;
    constructor(
        @InjectRepository(User) private userRepo: IUserRepository) {
        this.authService = new AutenticationService(this.userRepo);
    }

    async systemAuth(): Promise<User> {
        try {
            return await this.auth({
                password: 'admin',
                user: 'admin'
            });
        } catch (error) {
            throw new Error('nao foi possível autenticar o sistema');
        }   
    }

    async auth(auth: AuthDto): Promise<User> {
        try {
            return await this.authService.auth(auth.user, auth.password);
        }
        catch (error) {
            if (error instanceof UserNotFoundException) throw new UnauthorizedException('Usuario ou senha inválidos');
            throw error;
        }
    }

    async validUser(userdto: User): Promise<boolean> {
        return !(
            await this.userRepo
                .existsBy({
                    name: userdto.name
                }) ||
            await this.userRepo
                .existsBy({
                    email: userdto.email
                })
        )
    }

    async getUser(idUser: string): Promise<User> {
        if (!idUser) throw new UserNotFoundException();
        const user = await this.userRepo.findOne({
            where: {
                id: idUser
            }
        });
        if (!user) throw new UserNotFoundException();
        return user;
    }

    async saveUser(user: User): Promise<User> {
        const userObj = this.userRepo.create(user);
        const newUser = await this.userRepo.save(userObj);
        return newUser;
    }

    async guestAutentication(name: string): Promise<User> {
        return this.authService.authWeakness(name);
    }
}