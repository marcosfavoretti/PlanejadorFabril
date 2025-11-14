import { Injectable, Scope } from '@nestjs/common';
import { AgPlanejamentoIndividuo } from '../@core/classes/AgPlanejamentoIndividuo';
import { AgPlanejamentoConfig } from '../@core/classes/AgPlenejamentoConfig';
import { FitnessResponse } from '../@core/classes/FitnessResponse';
import { IOptimizer } from '../@core/interface/IOptimizer';
import { AgPlanejamentoInput } from '../@core/classes/AgPlanejamentoInput';
import { AgConfiguration } from '../@core/interface/AgConfigurations';

@Injectable({ scope: Scope.REQUEST })
export class AgPlanejamentoOptimizer {
  run(config: AgConfiguration, dados: AgPlanejamentoInput): void {}
  initialize(config: AgConfiguration, dados: AgPlanejamentoInput) {
    const daysMap = dados.qtdPorDia.entries();
    const lote = Number(dados.pedido.lote);
    while (lote > 0) {
      const datasLength = input.qtdPorDia.size;
      const split = 1 / datasLength;
      const randomNumber = Math.random();
      const targetDay = randomNumber / split;
    }
  }
}
