import { Inject, Injectable } from "@nestjs/common";
import { ComparaMudancaFabricaExecutorService } from "../@core/services/ComparaMudancaFabricaExecutor.service";
import { MudancasResDto } from "@dto/MudancaRes.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ConsutlarFabricaDTO } from "@dto/ConsultarFabrica.dto";

@Injectable()
export class ConsultarHistoricoFabricaUseCase{
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ComparaMudancaFabricaExecutorService) private comparaMudancaFabricaExecutorService: ComparaMudancaFabricaExecutorService 
    ){}

    async executaComparacao(dto: ConsutlarFabricaDTO):Promise<MudancasResDto[]>{
        const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
        const mudancas = await this.comparaMudancaFabricaExecutorService.compara(fabrica);
        return mudancas.map(mud=> MudancasResDto.fromClass(mud));
    }
}