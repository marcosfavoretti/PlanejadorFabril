import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { Fabrica } from '../entities/Fabrica.entity';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';

/**
 * Interface para validação de planejamento.
 *
 * Implementações devem lançar uma exceção se a validação falhar.
 */
export interface IValidaPlanejamento {
  /**
   * Valida um planejamento.
   *
   * @throws {ErroDeValidacao} se a validação falhar
   */
  valide(
    fabrica: Fabrica,
    pedido: Pedido,
    planejamentosTemp: PlanejamentoTemporario[],
  ): void | Promise<void>;
}

export const IValidaPlanejamento = Symbol('IValidaPlanejamento');
