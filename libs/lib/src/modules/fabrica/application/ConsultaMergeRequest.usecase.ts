import { Inject, InternalServerErrorException } from '@nestjs/common';
import { MergeRequestService } from '../infra/service/MergeRequest.service';
import { MergeRequestPendingDto } from '@dto/MergeRequestRes.dto';
import { FabricaService } from '../infra/service/Fabrica.service';

export class ConsultaMergeRequestUseCase {
  @Inject(MergeRequestService) private mergeRequestService: MergeRequestService;
  @Inject(FabricaService) private fabricaService: FabricaService;

  async consultar(): Promise<MergeRequestPendingDto[]> {
    try {
      const fabricaMain = await this.fabricaService.consultaFabricaPrincipal();
      if (!fabricaMain) throw new Error('Estamos sem fabrica principal');
      const upToDateMergeRequest =
        await this.mergeRequestService.findMergeByFather(fabricaMain);
      return upToDateMergeRequest.map((up) =>
        MergeRequestPendingDto.createByEntity(up),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.messsage);
    }
  }
}
