import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { FabricaService } from '../../infra/service/Fabrica.service';
import { CustomRequest } from 'src/modules/shared/@core/classes/CustomRequest';

@Injectable()
export class DonoDaFabricaGuard implements CanActivate {
  constructor(
    @Inject(FabricaService) private FabricaService: FabricaService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const fabricaId = request?.body?.fabricaId ?? request?.query?.fabricaId;
    if (!fabricaId) return false;
    const fabrica = await this.FabricaService.consultaFabrica(fabricaId);
    if (fabrica.principal) return true;
    if(fabrica.user.id !== request.user.id) throw new ForbiddenException({}, 'O usuario não pode acessar essa area');
    return true;
  }
}
