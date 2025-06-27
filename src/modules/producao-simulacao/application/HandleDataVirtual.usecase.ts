import { ConsoleLogger, Inject, InternalServerErrorException } from "@nestjs/common";
import { VirtualDateService } from "../infra/services/VirtualDate.service";
import { ParamDataVirtual } from "../@core/enum/ParamDataVirtual.enum";

export class HandleDateVirtualUseCase {
    @Inject(VirtualDateService) private virtualDateService: VirtualDateService;


    async handle(param: ParamDataVirtual): Promise<Date> {
        try {
            if (param === 'anterior') {
                return await this.virtualDateService.paraTras();
            }
            else if (param === 'proxima') {
                return await this.virtualDateService.praFrente();
            }
            else {
                throw new Error('Parametro desconhecido');
            }
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException('nao foi possivel persistir a data virtual');
        }
    }
}