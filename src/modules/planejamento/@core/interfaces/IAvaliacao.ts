import type { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";

export interface IAvaliacao{
    avaliacao(planejamento: PlanejamentoDiario[]):number;
}