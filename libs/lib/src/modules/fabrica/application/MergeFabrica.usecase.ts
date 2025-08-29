import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaResponseDto } from "@dto/FabricaResponse.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ConsutlarFabricaDTO } from "@dto/ConsultarFabrica.dto";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { UserService } from "@libs/lib/modules/user/infra/services/User.service";
import { ForkFabricaService } from "../infra/service/ForkFabrica.service";

export class MergeFabricaUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ForkFabricaService) private forkFabricaService: ForkFabricaService,
        @Inject(IUserService) private userService: UserService
    ) { }

    async merge(dto: ConsutlarFabricaDTO): Promise<FabricaResponseDto> {
        try {
            const [fabricaCandidata, fabricaPrincipalAtual] = await Promise.all([
                this.fabricaService.consultaFabrica(dto.fabricaId),
                this.fabricaService.consultaFabricaPrincipal(),
            ]);
            /**
             * PIPE DE VALIDACAO PARA VER SE O CANDIDATO PODE SUBIR A FABRICA
             * - validacao de datas dos pedidos
             * - 
             */
            
            //
            /**
             * FORK DA FABRICA
             */

            /**
             * invalidar a fabrica aceita para o usuario nao pode mais editala
             */
            const fabricaMergiada = await this.forkFabricaService.fork({
                fabrica: fabricaCandidata,
                isPrincipal: true,
                user: fabricaCandidata.user
            });
            const fabricaSalva = await this.fabricaService.saveFabrica(fabricaMergiada);
            //
            //retorno da fabrica nova mergiada
            return FabricaResponseDto.fromEntity(fabricaSalva);

        } catch (error) {
            if(error instanceof Error){
                throw new InternalServerErrorException(error.message)
            }
            throw error;
        }
    }
}