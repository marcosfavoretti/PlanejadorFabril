import { Inject, InternalServerErrorException } from "@nestjs/common";
import { Fabrica } from "../@core/entities/Fabrica.entity";
import { FabricaService } from "../infra/service/Fabrica.service";
import { FabricaResponseDto } from "src/delivery/dtos/FabricaResponse.dto";

export class ConsutlarFabricaPrincipalAtualUseCase {
    constructor(@Inject(FabricaService) private fabricaService: FabricaService) { }
    async consultar(): Promise<FabricaResponseDto> {
        try {
            const fabricaPrincipal = await this.fabricaService
                .consultaFabricaPrincipal();
            if (!fabricaPrincipal) throw new Error('Não foi possível encontrar a fabrica principal');
            return FabricaResponseDto.fromEntity(fabricaPrincipal);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}