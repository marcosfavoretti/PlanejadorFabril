/*
https://docs.nestjs.com/guards#guards
*/

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { JwtHandler } from '../services/JwtGenerator';
import { IUserService } from '../abstract/IUserService';
import { UserService } from '../../infra/services/User.service';
import { User } from '../entities/User.entity';
import { CustomRequest } from '@libs/lib/modules/shared/@core/classes/CustomRequest';
import { cookiesExtractor } from '@libs/lib/modules/shared/@core/utils/CookiesExtractor';

@Injectable()
export class JwtGuard implements CanActivate {
  private jwtHandler = new JwtHandler();
  constructor(@Inject(IUserService) private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: CustomRequest = context.switchToHttp().getRequest();
      // Tenta pegar do cookie (withCredentials)
      const cookies = cookiesExtractor(request);
      let accessToken = cookies && cookies['access_token'];

      // Se não encontrou no cookie, tenta pegar do header Authorization (Bearer)
      if (!accessToken) {
        const authHeader =
          request.headers['authorization'] || request.headers['Authorization'];
        if (
          authHeader &&
          typeof authHeader === 'string' &&
          authHeader.startsWith('Bearer ')
        ) {
          accessToken = authHeader.slice(7).trim();
        }
      }

      if (!accessToken) {
        return false;
      }

      const decodedToken = this.jwtHandler.decodeToken(accessToken) as User;
      console.log(decodedToken);
      const user = await this.userService.getUser(decodedToken.id);
      if (!user) {
        return false;
      }
      request.user = user;
      return this.jwtHandler.checkToken(accessToken);
    } catch (error) {
      return false;
    }
  }
}
