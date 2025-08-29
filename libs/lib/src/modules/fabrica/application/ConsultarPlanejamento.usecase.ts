import { Inject } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { ConsultaPlanejamentosDTO } from "@dto/ConsultaPlanejamentos.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { parse } from "date-fns";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";

export class ConsultarPlanejamentosUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService
    ) { }

    async consultar(dto: ConsultaPlanejamentosDTO): Promise<PlanejamentoResponseDTO[]> {
        const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
        const planejamentos = await this.consultaPlanejamento.consultaPlanejamentoDia(
            fabrica,
            parse(dto.dataInicial, 'dd-MM-yyyy', new Date()),
            new PlanejamentoOverWriteByPedidoService(),
            dto?.dataFinal ? parse(dto.dataFinal, 'dd-MM-yyyy', new Date()) : undefined
        );
        return planejamentos
            .sort(
                (a, b) => a.planejamento.dia.getTime() - b.planejamento.dia.getTime()
            )
            .flatMap(
                plan => PlanejamentoResponseDTO.fromEntity(plan.planejamento)
            );
    }
}