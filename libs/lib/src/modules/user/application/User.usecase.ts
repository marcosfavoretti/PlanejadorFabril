import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserBuilder } from "../@core/builder/User.builder";
import { User } from "../@core/entities/User.entity";
import { IUserService } from "../@core/abstract/IUserService";
import { CreateUserDto } from "@dto/CreateUser.dto";
import { AuthDto } from "@dto/Auth.dto";
import { JwtHandler } from "../@core/services/JwtGenerator";
import { UserNotFoundException } from "../@core/exceptions/UserNotFound.exception";
import { plainToInstance } from "class-transformer";
import { ISetUserCargo } from "../../cargos/@core/interfaces/ISetUserCargo";
import { CargoEnum } from "../../cargos/@core/enum/CARGOS.enum";
import { UserResponseDTO } from "@dto/UserResponse.dto";

@Injectable()
export class UserUsecase {
    private jwtGen: JwtHandler = new JwtHandler();

    constructor(
        @Inject(IUserService) private userService: IUserService,
        @Inject(ISetUserCargo) private setUserCargoService: ISetUserCargo
    ) { }

    public checkUserToken(token: string): boolean {
        return this.jwtGen.checkToken(token);
    }

    async createUser(dto: CreateUserDto): Promise<User> {
        try {
            const user = new UserBuilder()
                .withPassword(dto.password)
                .withEmail(dto.email)
                .withName(dto.name)
                .build();
            if (await this.userService.validUser(user)) {
                const finalUser = await this.userService.saveUser(user);
                await this.setUserCargoService.setUserCargo(finalUser, CargoEnum.USER);
                return finalUser;
            }
            throw new Error('usuario inválido, nome ou email já existe');
        } catch (error) {
            throw new BadRequestException('não foi possivel criar usuario!', error.message);
        }
    }

    async detailMe(userId: string): Promise<UserResponseDTO> {
        try {
            const targetUser = await this.userService.getUser(userId);
            return UserResponseDTO.fromEntity(targetUser);
        }
        catch (err) {
            if (err instanceof UserNotFoundException) throw err;
            throw new InternalServerErrorException(err);
        }
    }

    async login(dto: AuthDto): Promise<string> {
        try {
            const user = await this.userService.auth(dto);
            const user2jwt = plainToInstance(User, user, { excludeExtraneousValues: true });
            return this.jwtGen.generateToken(user2jwt);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException("problemas ao efetuar o login", error.message);
        }
    }

    async loginAsGuest(dto: { name: string }): Promise<User> {
        return await this.userService.guestAutentication(dto.name);
    }
}