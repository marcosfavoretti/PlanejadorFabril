import { FitnessResponse } from "../classes/FitnessResponse";

export interface IFitnessFunction<INDIVIDUO_TYPE> {
    fitness(individuo: INDIVIDUO_TYPE): Promise<FitnessResponse<INDIVIDUO_TYPE>> | FitnessResponse<INDIVIDUO_TYPE>;
}