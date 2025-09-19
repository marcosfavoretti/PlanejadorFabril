import { AgPlanejamentoIndividuo } from "../classes/AgPlanejamentoIndividuo";
import { FitnessResponse } from "../classes/FitnessResponse";
import { IFitnessFunction } from "../interface/IFitnessFunction";

export class AgPlanejamentoFitnessFn
    implements IFitnessFunction<AgPlanejamentoIndividuo> {
    fitness(individuo: AgPlanejamentoIndividuo): FitnessResponse<AgPlanejamentoIndividuo> {
        const response = new FitnessResponse<AgPlanejamentoIndividuo>();
        response.fitness = 0;
        response.individuo = individuo
        return response;
    }
}