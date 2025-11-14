import { ForbiddenException, Inject } from '@nestjs/common';
import { FabricaService } from '../infra/service/Fabrica.service';
import { ConsutlarFabricaDTO } from '@dto/ConsultarFabrica.dto';
import { User } from '@libs/lib/modules/user/@core/entities/User.entity';

export class DeletarFabricaUseCase {
  constructor(@Inject(FabricaService) private fabricaService: FabricaService) {}

  async deleta(dto: ConsutlarFabricaDTO, user: User): Promise<void> {
    const consultaFabrica = await this.fabricaService.consultaFabrica(
      dto.fabricaId,
    );
    return await this.fabricaService.removerFabrica(consultaFabrica);
  }
}
