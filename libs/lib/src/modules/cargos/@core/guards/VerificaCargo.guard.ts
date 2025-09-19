import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CargoInapropriadoException } from '../exception/CargoInapropriado.exception';
import { ROLES_KEY } from '../decorator/Cargo.decorator';
import { User } from '@libs/lib/modules/user/@core/entities/User.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    
    if (!requiredRoles) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    if(user?.cargosLista === undefined) throw new CargoInapropriadoException();
    const ok = requiredRoles.some(role => user?.cargosLista.includes(role));
    if (!ok) throw new CargoInapropriadoException();
    return true;
  }
}
