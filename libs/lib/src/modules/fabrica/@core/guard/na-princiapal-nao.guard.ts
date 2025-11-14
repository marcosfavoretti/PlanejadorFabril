import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { FabricaService } from '../../infra/service/Fabrica.service';
import { CustomRequest } from '@libs/lib/modules/shared/@core/classes/CustomRequest';

@Injectable()
export class NaPrincipalNao implements CanActivate {
  constructor(@Inject(FabricaService) private FabricaService: FabricaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CustomRequest>();
    const fabricaId = request?.body?.fabricaId ?? request?.query?.fabricaId;
    if (!fabricaId) return false;
    const fabrica = await this.FabricaService.consultaFabrica(fabricaId);
    if (fabrica.principal)
      throw new BadRequestException(
        'A fabrica principal não pode afetuar essa ação',
      );
    return true;
  }
}
