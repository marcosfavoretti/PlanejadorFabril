import { AgConfiguration } from '../interface/AgConfigurations';
import { IFitnessFunction } from '../interface/IFitnessFunction';
import { AgPlanejamentoFitnessFn } from '../services/AgPlanejamentoFitnessFn';
import { AgPlanejamentoIndividuo } from './AgPlanejamentoIndividuo';

export class AgPlanejamentoConfig extends AgConfiguration {
  FITNESS_FUNCTION: IFitnessFunction<AgPlanejamentoIndividuo> =
    new AgPlanejamentoFitnessFn();
}
