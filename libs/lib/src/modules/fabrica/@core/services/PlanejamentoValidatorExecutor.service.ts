import { Inject } from '@nestjs/common';
import { IValidaPlanejamento } from '../interfaces/IValidaPlanejamento';
import { Fabrica } from '../entities/Fabrica.entity';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';
import { ValidadorPlanejamento } from '../../ValidaPlenejamento.provider';

export class PlanejamentoValidatorExecutorService {
  constructor(
    @Inject(ValidadorPlanejamento) private validator: IValidaPlanejamento[],
  ) {}

  async execute(
    fabrica: Fabrica,
    pedido: Pedido,
    planejamentoTemp: PlanejamentoTemporario[],
  ): Promise<void> {
    for (const validacaoPlanejado of this.validator) {
      await validacaoPlanejado.valide(fabrica, pedido, planejamentoTemp);
    }
  }
}
