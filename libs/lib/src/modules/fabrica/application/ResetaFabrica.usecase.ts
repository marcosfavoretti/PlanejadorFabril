import { FabricaResponseDto } from "@dto/FabricaResponse.dto";
import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaService } from "../infra/service/Fabrica.service";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { ResetaFabricaDTO } from "@dto/ResetaFabrica.dto";
import { DeletaSnapShotService } from "../infra/service/DeletaSnapShot.service";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";

export class ResetaFabricaUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(IUserService) private userService: IUserService,
        @Inject(DeletaSnapShotService) private deletaSnapShotService: DeletaSnapShotService
    ) { }
    async reseta(dto: ResetaFabricaDTO, userId: string): Promise<FabricaResponseDto> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
            const user = await this.userService.getUser(userId);
            if (fabrica.principal || fabrica.checkPoint) throw new Error("Fabricas checkpoint/principais nao podem ser reiniciadas");
            if (fabrica.user.id !== user.id) throw new Error('Apenas o autor pode reiniciar a fabrica');
            await this.deletaSnapShotService.deletePlanejamentosSnapShot(fabrica);
            return FabricaResponseDto.fromEntity(fabrica);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}