import { Inject } from '@nestjs/common';
import { ConsultaPlanejamentoService } from '../../infra/service/ConsultaPlanejamentos.service';
import { IComparaMudancasFabrica } from '../interfaces/IComparaMudancasFabricas';
import { Fabrica } from '../entities/Fabrica.entity';
import { PlanejamentoOverWriteByPedidoService } from './PlanejamentoOverWriteByPedido.service';
import { Mudancas, TipoMudancas } from '../classes/Mudancas';
import { Planejamento } from '@libs/lib/modules/planejamento/@core/entities/Planejamento.entity';
import { format } from 'date-fns';

export class MudancaQtdPlanejamento implements IComparaMudancasFabrica {
  constructor(
    @Inject(ConsultaPlanejamentoService)
    private consultaPlanejamentoService: ConsultaPlanejamentoService,
  ) {}

  async compara(fabricaA: Fabrica, fabricaB: Fabrica): Promise<Mudancas[]> {
    const strategy = new PlanejamentoOverWriteByPedidoService();

    // 1. Consulta os planejamentos de ambas as fábricas (estado "antigo" e "novo")
    const [planA, planB] = await Promise.all([
      this.consultaPlanejamentoService.consultaPlanejamentoAtual(
        fabricaA,
        strategy,
      ),
      this.consultaPlanejamentoService.consultaPlanejamentoAtual(
        fabricaB,
        strategy,
      ),
    ]);

    // 2. Define as chaves e funções de log
    const getKey = (p: Planejamento): string =>
      `${p.item.Item}|${p.dia.toISOString()}|${p.setor.codigo}|${p.pedido.id}`;

    // O logKey agora será usado para mostrar o estado "antes" e "depois"
    const logKey = (p: Planejamento): string =>
      `Dia: ${format(p.dia, 'dd/MM/yyyy')}\nItem: ${p.item.tipo_item}\nSetor: ${p.setor.nome}\nQtd: ${p.qtd}`;

    // 3. Mapeia o estado "novo" (fabricaB) para consulta rápida
    // O valor do map (p) é o objeto wrapper que contém 'planejamento'
    const mapB = new Map(planB.map((p) => [getKey(p.planejamento), p]));

    const mudancas: Mudancas[] = [];

    // 4. Itera sobre o estado "antigo" (fabricaA)
    for (const pAWrapper of planA) {
      const key = getKey(pAWrapper.planejamento);

      // 5. Verifica se o item TAMBÉM existe no estado "novo" (mapB)
      if (mapB.has(key)) {
        // Item existe em ambos, vamos comparar as quantidades
        const pBWrapper = mapB.get(key);

        const pA = pAWrapper.planejamento; // Planejamento antigo
        const pB = pBWrapper!.planejamento; // Planejamento novo

        // 6. Se a quantidade for diferente, registra a mudança
        if (pA.qtd !== pB.qtd) {
          mudancas.push(
            new Mudancas(
              TipoMudancas.ATUALIZACAO, // Assumindo que seu enum tem 'ALTERACAO'
              'Planejamento (Qtd)',
              logKey(pB), // Valor antigo
              logKey(pA), // Valor novo
            ),
          );
        }
      }
    }

    return mudancas;
  }
}
