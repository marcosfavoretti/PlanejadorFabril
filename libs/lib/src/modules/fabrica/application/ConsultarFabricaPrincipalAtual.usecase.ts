import { Inject, InternalServerErrorException } from '@nestjs/common';
import { FabricaService } from '../infra/service/Fabrica.service';
import { FabricaResponseDto } from '@dto/FabricaResponse.dto';

export class ConsutlarFabricaPrincipalAtualUseCase {
  constructor(@Inject(FabricaService) private fabricaService: FabricaService) {}
  async consultar(): Promise<FabricaResponseDto> {
    try {
      const fabricaPrincipal =
        await this.fabricaService.consultaFabricaPrincipal();
      if (!fabricaPrincipal)
        throw new Error('Não foi possível encontrar a fabrica principal');
      return FabricaResponseDto.fromEntity(fabricaPrincipal);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
