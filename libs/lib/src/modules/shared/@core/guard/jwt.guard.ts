/*
https://docs.nestjs.com/guards#guards
*/

import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { JwtHandler } from "@libs/lib/modules/user/@core/services/JwtGenerator";
import { CustomRequest } from '../classes/CustomRequest';
import { cookiesExtractor } from '../utils/CookiesExtractor';
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { UserService } from "@libs/lib/modules/user/infra/services/User.service";

@Injectable()
export class JwtGuard implements CanActivate {
  private jwtHandler = new JwtHandler();
  constructor(
    @Inject(IUserService) private userService: UserService
  ) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try {
      const request: CustomRequest = context.switchToHttp().getRequest();
      const cookies = cookiesExtractor(request);
      const accessToken = cookies && cookies['access_token'];
      if (!accessToken) {
        return false;
      }
      const decodedToken = this.jwtHandler.decodeToken(accessToken) as User;
      const user = await this.userService.getUser(decodedToken.id);
      if (!user) {
        return false;
      }
      request.user = user;
      return this.jwtHandler.checkToken(accessToken);
    }
    catch (error) {
      return false;
    }
  }
}