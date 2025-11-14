import {
  CalculaDividaDoPlanejamentoProps,
  ICalculoDivida,
} from '../interfaces/ICalculoDivida';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';
import { Inject, Logger } from '@nestjs/common';
import { IMontaEstrutura } from '../../../item/@core/interfaces/IMontaEstrutura.ts';
import { DividaTemporariaBuilder } from '../builder/DividaTemporaria.builder';
import { IConsultaRoteiro } from '../../../item/@core/interfaces/IConsultaRoteiro';
import { DividaTemporaria } from '../classes/DividaTemporaria';
import { SetorChainFactoryService } from './SetorChainFactory.service';
import { PipeSemSetorException } from '../exception/PipeSemOSetor.exception';

export class CalculaDividaDoPlanejamento implements ICalculoDivida {
  constructor(
    @Inject(IMontaEstrutura) private montaEstrutura: IMontaEstrutura,
    @Inject(IConsultaRoteiro) private consultarRoteiro: IConsultaRoteiro,
    @Inject(SetorChainFactoryService)
    private setorChainFactoryService: SetorChainFactoryService,
  ) {}

  async calc(
    props: CalculaDividaDoPlanejamentoProps,
  ): Promise<DividaTemporaria[]> {
    const dividas: DividaTemporaria[] = [];

    /**
     * organiza o mapa para ter um ITEM | PLANEJAMENTO
     */
    const itemMap = new Map<string, PlanejamentoTemporario[]>();
    for (const plan of props.planejamentos) {
      const itemCodigo = plan.item.getCodigo();
      if (!itemMap.has(itemCodigo)) itemMap.set(itemCodigo, []);
      itemMap.get(itemCodigo)!.push(plan);
    }

    /**
     * monta a estrutura do produto
     */
    const itemEstrutura = await this.montaEstrutura.monteEstrutura(
      props.pedido.item,
    );
    const itemAsList = itemEstrutura.itensAsList();

    /**
     * consulta os roteiros dos itens
     */
    const roteirosPorItem = await Promise.all(
      itemAsList.map((i) => this.consultarRoteiro.roteiro(i)),
    );

    /**
     * verifica cada item da estrutura verficando se quantidade esta ok
     */
    for (let idx = 0; idx < itemAsList.length; idx++) {
      const targetItem = itemAsList[idx];
      const roteiros = roteirosPorItem[idx];
      const planejamentos = itemMap.get(targetItem.getCodigo()) || [];

      /**
       * entra em cada roteiro do item para ver em nivel de setor se esta tudo ok
       */
      for (const roteiro of roteiros) {
        try {
          // Filtra planejamentos que pertencem ao roteiro atual
          const planejamentosSetor = planejamentos.filter(
            (plan) => plan.setor === roteiro,
          );
          const totalPlanejado = planejamentosSetor.reduce(
            (sum, plan) => sum + plan.qtd,
            0,
          );
          const totalPlanejadoIdeal = props.pedido.lote;

          Logger.warn(
            totalPlanejadoIdeal +
              '-------------' +
              totalPlanejado +
              '-----' +
              roteiro,
          );

          //isso serve para ver se o setor da estrutura esta sendo mapeado nesse programa de estrutura
          //por exemplo. Solda Robo, nao esta, logo ela nao deve ser contabilizado
          await this.setorChainFactoryService.getSetor(roteiro);

          const resultado = totalPlanejadoIdeal - totalPlanejado;

          resultado !== 0 &&
            dividas.push(
              new DividaTemporariaBuilder()
                .item(targetItem)
                .pedido(props.pedido)
                .qtd(resultado)
                .setor(roteiro)
                .build(),
            );
        } catch (error) {
          if (error instanceof PipeSemSetorException) continue;
          console.error(error);
          throw error;
        }
      }
    }

    return dividas;
  }
}
