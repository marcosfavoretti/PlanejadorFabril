import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { UserUsecase } from "../../modules/user/application/User.usecase";
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthDto } from "../dtos/Auth.dto";
import { Request, Response } from "express";
import { User } from "../../modules/user/@core/entities/User.entity";
import { JwtGuard } from "../../modules/user/@core/guard/jwt.guard";
import { CustomRequest } from "src/modules/shared/@core/classes/CustomRequest";

@ApiTags('User')
@Controller('user')
export class UserController {
    @Inject(UserUsecase) private useCase: UserUsecase

    @Post('/')
    @ApiResponse({
        status: HttpStatus.OK,
        type: () => User,
    })
    public async createUserMethod(@Body() payload: CreateUserDto) {
        return this.useCase.createUsuer(payload);
    }

    @Post('/ping')
    @ApiBearerAuth('XYZ')
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'No content',
    })
    public async checkUserAuth() {
        return;
    }

    @Post('/auth')
    @ApiResponse({
        status: 200,
        description: 'User successfully authenticated',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    @HttpCode(HttpStatus.OK)
    public async loginMethod(@Body() payload: AuthDto, @Res({ passthrough: true }) response: Response) {
        const jwt = await this.useCase.login(payload);
        response.cookie('access_token', jwt, {
            httpOnly: true,
            sameSite: 'lax'
        });
        return { token: jwt };
    }

    @Post('/logout')
    @ApiBearerAuth('XYZ')
    @UseGuards(JwtGuard)
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: 200,
        description: 'User successfully logged out',
    })
    public async logoutMethod(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token', {
            httpOnly: true,
            sameSite: 'lax',
        });
        return { message: 'Logout successful' };
    }

    @Get('/me')
    @ApiBearerAuth('XYZ')
    @UseGuards(JwtGuard)
    @ApiResponse({
        status: 200,
        type: User
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    public async userDetailsMethod(@Req() req: CustomRequest) {
        return await this.useCase.detailMe(req.user.id);
    }

}