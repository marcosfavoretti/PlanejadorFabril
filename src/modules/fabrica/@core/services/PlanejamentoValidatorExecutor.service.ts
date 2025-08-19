import { Inject } from "@nestjs/common";
import { IValidaPlanejamento } from "../interfaces/IValidaPlanejamento";
import { Fabrica } from "../entities/Fabrica.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";


export class PlanejamentoValidatorExecutorService {
    constructor(@Inject(IValidaPlanejamento) private validator: IValidaPlanejamento[]) { 
    }

    async execute(fabrica: Fabrica, pedido: Pedido, planejamentoTemp: PlanejamentoTemporario[]): Promise<void> {
        for (const validacaoPlanejado of this.validator) {
            await validacaoPlanejado.valide(fabrica, pedido, planejamentoTemp)
        }
    }
}