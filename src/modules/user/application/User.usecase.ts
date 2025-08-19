import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserBuilder } from "../@core/builder/User.builder";
import { User } from "../@core/entities/User.entity";
import { IUserService } from "../@core/abstract/IUserService";
import { CreateUserDto } from "../../../delivery/dtos/CreateUser.dto";
import { AuthDto } from "../../../delivery/dtos/Auth.dto";
import { JwtHandler } from "../@core/services/JwtGenerator";
import { UserNotFoundException } from "../@core/exceptions/UserNotFound.exception";

@Injectable()
export class UserUsecase {
    private jwtGen: JwtHandler = new JwtHandler();

    constructor(
        @Inject(IUserService) private userService: IUserService
    ) { }

    public checkUserToken(token: string): boolean {
        return this.jwtGen.checkToken(token);
    }

    async createUsuer(dto: CreateUserDto): Promise<User> {
        try {
            const user = new UserBuilder()
                .withPassword(dto.password)
                .withEmail(dto.email)
                .withName(dto.name)
                .build();
            if (await this.userService.validUser(user)) {
                return await this.userService.saveUser(user);
            }
            throw new Error('usuario inválido, nome ou email já existe')
        } catch (error) {
            throw new BadRequestException('não foi possivel criar usuario!', error.message);
        }
    }

    async detailMe(userId: string): Promise<User> {
        try {
            return await this.userService.getUser(userId);
        }
        catch (err) {
            if (err instanceof UserNotFoundException) throw err;
            throw new InternalServerErrorException(err);
        }
    }

    async login(dto: AuthDto): Promise<string> {
        try {
            const user = await this.userService.auth(dto);
            return this.jwtGen.generateToken(user);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException("problemas ao efetuar o login", error.message);
        }
    }

    async loginAsGuest(dto: { name: string }): Promise<User> {
        return await this.userService.guestAutentication(dto.name);
    }
}