import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { Fabrica } from '../entities/Fabrica.entity';

export class FabricaPlanejadaErradaException extends Error {
  constructor(
    fabrica: Fabrica,
    pedido: Pedido,
    descrepancias: Map<string, number>,
  ) {
    // Transforma o mapa de discrepâncias em uma lista de strings legíveis
    const detalhesDasDiscrepancias = Array.from(descrepancias.entries())
      .map(([itemSetor, diferenca]) => {
        const [item, setor] = itemSetor.split(';');

        // Se a diferença for positiva, significa que a quantidade planejada é MENOR que a ideal (FALTA)
        if (diferenca > 0) {
          return `  - [ITEM: ${item}, SETOR: ${setor}] -> Faltando ${diferenca} unidades.`;
        }
        // Se a diferença for negativa, significa que a quantidade planejada é MAIOR que a ideal (SOBRA)
        else {
          return `  - [ITEM: ${item}, SETOR: ${setor}] -> Sobrando ${Math.abs(diferenca)} unidades.`;
        }
      })
      .join('\n'); // Junta cada item da lista com uma quebra de linha

    // Constrói a mensagem final, que é muito mais clara
    const mensagem = `A fábrica ${fabrica.fabricaId} possui um planejamento inválido no pedido ${pedido.id}. Foram encontradas as seguintes discrepâncias:\n\n${detalhesDasDiscrepancias}`;

    super(mensagem);
    this.name = 'FabricaPlanejadaErradaException';
  }
}
