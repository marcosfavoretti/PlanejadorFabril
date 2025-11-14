import { Inject, InternalServerErrorException } from '@nestjs/common';
import { FabricaResponseDto } from '@dto/FabricaResponse.dto';
import { FabricaService } from '../infra/service/Fabrica.service';
import { ForkFabricaService } from '../infra/service/ForkFabrica.service';
import { ValidaFabrica } from '../ValidaFabrica.provider';
import { IValidaFabrica } from '../@core/interfaces/IValidaFabrica';
import { MergeFabricaDto } from '@dto/MergeFabrica.dto';
import { MergeRequestService } from '../infra/service/MergeRequest.service';
import { User } from '../../user/@core/entities/User.entity';

export class MergeFabricaUseCase {
  constructor(
    @Inject(ValidaFabrica) private validaFabrica: IValidaFabrica[],
    @Inject(MergeRequestService)
    private mergeRequestService: MergeRequestService,
    @Inject(FabricaService) private fabricaService: FabricaService,
    @Inject(ForkFabricaService) private forkFabricaService: ForkFabricaService,
  ) {}

  async merge(props: {
    dto: MergeFabricaDto;
    user: User;
  }): Promise<FabricaResponseDto> {
    try {
      const { mergeRequestId } = props.dto;
      const mergeRequest =
        await this.mergeRequestService.findMerge(mergeRequestId);
      const fabrica = await this.fabricaService.consultaFabrica(
        mergeRequest.fabrica.fabricaId,
      );
      /**
       * PIPE DE VALIDACAO PARA VER SE O CANDIDATO PODE SUBIR A FABRICA AINDA
       */
      for (const validationEstrategia of this.validaFabrica) {
        await validationEstrategia.valide(fabrica);
      }
      //
      /**
       * FORK DA FABRICA
       */
      const fabricaMergiada = await this.forkFabricaService.fork({
        fabrica: fabrica,
        isPrincipal: true,
        user: fabrica.user,
        forceCheckPoint: true,
      });
      const fabricaSalva =
        await this.fabricaService.saveFabrica(fabricaMergiada);
      //
      //retorno da fabrica nova mergiada
      await this.mergeRequestService.saveMergeComplete(
        mergeRequest,
        props.user,
      );
      return FabricaResponseDto.fromEntity(fabricaSalva);
      //
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        throw new InternalServerErrorException(error.message);
      }
      throw error;
    }
  }
}
