import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import type { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";

export interface IGerenciadorPlanejamentoMutation {
    appendPlanejamento(planejamentos: PlanejamentoTemporario[]): Promise<PlanejamentoDiario[]>
}

export const IGerenciadorPlanejamentoMutation = Symbol('IGerenciadorPlanejamentoMutation');