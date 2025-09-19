import { ConsultaPlanejamentoService } from "@libs/lib/modules/fabrica/infra/service/ConsultaPlanejamentos.service";
import { Inject } from "@nestjs/common";
import { IOptimizer } from "../../../../../../libs/lib/src/modules/ag/@core/interface/IOptimizer";

export class AgOptimizerUseCase implements IOptimizer {
    @Inject(ConsultaPlanejamentoService) private consultaPlanejamentos: ConsultaPlanejamentoService;

    async execute(): Promise<void> {
        const planejamentos = await this.consultaPlanejamentos.consultaPlanejamentoDaFabricaPrincipal();
        console.log(planejamentos);
    }
}