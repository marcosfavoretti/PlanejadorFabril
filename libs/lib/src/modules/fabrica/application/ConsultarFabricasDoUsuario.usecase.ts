import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ConsultaFabricaDoUsuarioDTO } from "@dto/ConsultaFabricaDoUsuario.dto";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { UserFabricaResponseDto } from "@dto/UserFabricaResponse.dto";

export class ConsutlarFabricasDoUsuarioUseCase {
    constructor(
        @Inject(IUserService) private userService: IUserService,
        @Inject(FabricaService) private fabrica: FabricaService,
        @Inject(FabricaService) private fabricaService: FabricaService
    ) { }

    async consultar(dto: ConsultaFabricaDoUsuarioDTO): Promise<UserFabricaResponseDto[]> {
        try {
            const user = await this.userService
                .getUser(dto.userId);

            const fabricas = await this.fabrica
                .consultaFabricasDoUsuario(user);

            const fabricaPrincipal = await this.fabricaService
                .consultaFabricaPrincipal();

            return fabricas
                .filter(f => !f.principal)
                .map(f => UserFabricaResponseDto.fromEntity(f, fabricaPrincipal?.fabricaId !== f.fabricaPai?.fabricaId));
                
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}