import { Inject, InternalServerErrorException } from "@nestjs/common";
import { VirtualDateService } from "../infra/services/VirtualDate.service";

export class ConsultarDateVirtualUseCase {
    @Inject(VirtualDateService) private virtualDateService: VirtualDateService;

    async consulta(): Promise<Date> {
        try {
            return (await this.virtualDateService.getVirtualDate()).virtualDate;
        } catch (error) {
            throw new InternalServerErrorException('nao foi possivel persistir a data virtual');
        }
    }
}