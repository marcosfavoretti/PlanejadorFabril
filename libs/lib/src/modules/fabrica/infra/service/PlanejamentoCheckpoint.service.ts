import { Inject } from "@nestjs/common";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { IGeraCheckPoint } from "../../@core/interfaces/IGeraCheckPoint";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";

export class PlanejamentoCheckPoint implements
    IGeraCheckPoint {

    @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService

    /**
     * 
     * @param fabricaAtual 
     * @param fabricaPassada
     * @description adiciona por referencia na fabrica atual as depedencias sumarizadas dos ancestrais 
     */
    async gerar(fabricaAtual: Fabrica, fabricaPassada: Fabrica): Promise<void> {
        const planejamentos = await this.consultaPlanejamento
            .consultarPlanejamentosFuturos(fabricaPassada, new PlanejamentoOverWriteByPedidoService());
        fabricaAtual
            .appendPlanejamento(
                planejamentos.map(plan => plan.copy())
            );
    }
}