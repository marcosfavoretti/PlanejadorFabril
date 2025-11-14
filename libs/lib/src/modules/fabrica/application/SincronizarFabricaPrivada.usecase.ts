import { FabricaResponseDto } from '@dto/FabricaResponse.dto';
import { SincronizarFabricaPrivadaDTO } from '@dto/SincronizarFabricaPrivada.dto';
import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { FabricaService } from '../infra/service/Fabrica.service';

export class SincronizarFabricaPrivadaUseCase {
  constructor(@Inject(FabricaService) private fabricaService: FabricaService) {}

  async sincroniza(
    dto: SincronizarFabricaPrivadaDTO,
  ): Promise<FabricaResponseDto> {
    try {
      const [fabricaPrincipal, fabrica] = await Promise.all([
        this.fabricaService.consultaFabricaPrincipal(),
        this.fabricaService.consultaFabrica(dto.fabricaId),
      ]);
      fabrica.fabricaPai = fabricaPrincipal!;
      const fabricaNova = await this.fabricaService.saveFabrica(fabrica);
      return FabricaResponseDto.fromEntity(fabricaNova);
    } catch (error) {
      Logger.error(
        `não foi possível sincronizar a fabrica principal com a fabrica ${dto.fabricaId}`,
      );
      throw new InternalServerErrorException(error);
    }
  }
}
