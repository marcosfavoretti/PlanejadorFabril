import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { Divida } from "../entities/Divida.entity";

export class FabricaPlanejamentoResultado {
    divida: Divida[];
    planejamentos: Planejamento[];
}