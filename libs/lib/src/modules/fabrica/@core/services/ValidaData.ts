import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';
import { Fabrica } from '../entities/Fabrica.entity';
import { IValidaPlanejamento } from '../interfaces/IValidaPlanejamento';
import { ErroDeValidacao } from '../exception/ErroDeValidacao.exception';
import { isBefore, startOfToday, startOfTomorrow } from 'date-fns';

export class ValidaData implements IValidaPlanejamento {
  /**
   * @param fabrica
   * @param pedido
   * @param planejamentosTemp
   * @description
   * O planejamentos nunca pode alocar itens pro dia atual, sempre para dias na frente
   */
  valide(
    fabrica: Fabrica,
    pedido: Pedido,
    planejamentosTemp: PlanejamentoTemporario[],
  ): void {
    const [primeiroPlanejado] = planejamentosTemp.sort(
      (a, b) => a.dia.getTime() - b.dia.getTime(),
    );
    if (!primeiroPlanejado) return;
    if (isBefore(primeiroPlanejado.dia, startOfToday())) {
      throw new ErroDeValidacao(
        'Data do planejamento não pode ser anterior ao dia atual',
      );
    }
  }
}
