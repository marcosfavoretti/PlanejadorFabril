import { Inject, InternalServerErrorException } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { ConsultaPlanejamentosDTO } from "@dto/ConsultaPlanejamentos.dto";
import { FabricaService } from "../infra/service/Fabrica.service";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { parse, startOfDay } from "date-fns";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";

export class ConsultarPlanejamentosUseCase {
    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService
    ) { }

    async consultar(dto: ConsultaPlanejamentosDTO): Promise<PlanejamentoResponseDTO[]> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
            const planejamentos = await this.consultaPlanejamento.consultaPlanejamentoDia(
                fabrica,
                startOfDay(dto.dataInicial),
                new PlanejamentoOverWriteByPedidoService(),
                dto?.dataFinal ? dto.dataFinal : undefined
            );
            return planejamentos
                .sort(
                    (a, b) => a.planejamento.dia.getTime() - b.planejamento.dia.getTime()
                )
                .flatMap(
                    plan => PlanejamentoResponseDTO.fromEntity(plan.planejamento)
                );
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}