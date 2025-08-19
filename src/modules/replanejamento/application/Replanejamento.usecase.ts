import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaService } from "src/modules/fabrica/infra/service/Fabrica.service";
import { VirtualDateService } from "src/modules/fabrica/infra/service/VirtualDate.service";

export class ReplanejamentoUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(VirtualDateService) private virtualDateService: VirtualDateService
    ) { }

    async replanejamento(): Promise<void> {
        try {
            // await this.fabricaService.replanejamento();
            // await this.virtualDateService.praFrente();
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}