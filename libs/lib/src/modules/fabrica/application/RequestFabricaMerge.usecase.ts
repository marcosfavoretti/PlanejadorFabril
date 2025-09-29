import { Inject, InternalServerErrorException } from "@nestjs/common";
import { MergeRequestService } from "../infra/service/MergeRequest.service";
import { ConsutlarFabricaDTO } from "@dto/ConsultarFabrica.dto";
import { User } from "../../user/@core/entities/User.entity";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ValidaFabrica } from "../ValidaFabrica.provider";
import { IValidaFabrica } from "../@core/interfaces/IValidaFabrica";
import { FabricaDuplicadaMergeException } from "../@core/exception/FabricaDuplicadaMerge.exception";
import { IGeraCheckPoint } from "../@core/interfaces/IGeraCheckPoint";

export class RequestFabricaMergeUseCase {
    constructor(
        @Inject(ValidaFabrica) private validaFabrica: IValidaFabrica[],
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(MergeRequestService) private mergeRequestService: MergeRequestService,
    ) { }

    async request(props: { dto: ConsutlarFabricaDTO, user: User }): Promise<void> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(props.dto.fabricaId);
            /**
             * valida se a fabrica pode subir ou nao --> validation pipe//
             */
            const hasRegistro = await this.mergeRequestService.findMergeByFabrica(fabrica);

            if (hasRegistro.length) throw new FabricaDuplicadaMergeException();

            for (const validationEstrategia of this.validaFabrica) {
                await validationEstrategia.valide(fabrica);
            }
            //
            await this.mergeRequestService.createMerge(fabrica, props.user);
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error.message)
        }
    }
}