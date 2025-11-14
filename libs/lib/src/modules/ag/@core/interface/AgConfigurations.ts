import { IFitnessFunction } from './IFitnessFunction';
import { IInitializeFunction } from './IInitializeFunction';

export abstract class AgConfiguration {
  POPULATION_SIZE: 100;
  EPOCHS: 100;
  MUTATION_RATE: 0.5;
  FITNESS_FUNCTION: IFitnessFunction<unknown>;
}
