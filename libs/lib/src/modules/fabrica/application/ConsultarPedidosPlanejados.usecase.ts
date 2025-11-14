import { Inject, InternalServerErrorException } from '@nestjs/common';
import { FabricaService } from '../infra/service/Fabrica.service';
import { ConsutlarFabricaDTO } from '@dto/ConsultarFabrica.dto';
import { PedidosPlanejadosResponseDTO } from '@dto/PedidosPlanejadosResponse.dto';
import { DividaService } from '../infra/service/Divida.service';
import { BuscaPedidosService } from '../infra/service/BuscaPedidos.service';
import { PlanejamentoSnapShot } from '../@core/entities/PlanejamentoSnapShot.entity';
import { DividaSnapShot } from '../@core/entities/DividaSnapShot.entity';

export class ConsultarPedidosPlanejadosUseCase {
  constructor(
    @Inject(FabricaService) private fabricaService: FabricaService,
    @Inject(DividaService) private dividaService: DividaService,
    @Inject(BuscaPedidosService) private buscarPedido: BuscaPedidosService,
  ) {}

  async consultar(
    dto: ConsutlarFabricaDTO,
  ): Promise<PedidosPlanejadosResponseDTO[]> {
    try {
      const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
      const pedidos = await this.buscarPedido.pedidosNaFabrica(fabrica);
      //n+1;
      const [dividas, atraso] = await Promise.all([
        this.dividaService.consultarDividaDoPedido(fabrica, ...pedidos),
        this.buscarPedido.buscaAtraso(fabrica, pedidos),
      ]);

      // const dividasMap = new Map<number, DividaSnapShot[]>();
      // dividas.forEach(a => { const key = a.divida.pedido.id; const value = (dividasMap.get(key) || []); dividasMap.set(key, value.concat(a)) });

      // const atrasosMap = new Map<number, PlanejamentoSnapShot[]>();
      // atraso.forEach(a => { const key = a.planejamento.pedido.id; const value = (atrasosMap.get(key) || []); atrasosMap.set(key, value.concat(a)) });

      console.log('->>>', dividas.length);

      const dividasMap = dividas.reduce(
        (map, a) => {
          const key = a.divida.pedido.id;
          (map[key] = map[key] || []).push(a);
          return map;
        },
        {} as Record<number, DividaSnapShot[]>,
      );

      const atrasosMap = atraso.reduce(
        (map, a) => {
          const key = a.planejamento.pedido.id;
          (map[key] = map[key] || []).push(a);
          return map;
        },
        {} as Record<number, PlanejamentoSnapShot[]>,
      );

      const response: PedidosPlanejadosResponseDTO[] = [];
      for (const [idx, pedido] of pedidos.entries()) {
        const planejamentosAtrasados = atrasosMap[pedido.id];
        const dividas = dividasMap[pedido.id];
        response.push({
          atrasos:
            planejamentosAtrasados?.map((plan) => ({
              item: {
                Item: plan.planejamento.item.getCodigo(),
                tipo_item: plan.planejamento.item.getTipoItem(),
              },
              qtd: plan.planejamento.qtd,
              setorCodigo: plan.planejamento.setor.codigo,
            })) || [],
          dividas:
            dividas?.map((plan) => ({
              item: {
                Item: plan.divida.item.getCodigo(),
                tipo_item: plan.divida.item.getTipoItem(),
              },
              qtd: plan.divida.qtd,
              setorCodigo: plan.divida.setor.codigo,
            })) || [],
          pedido: {
            ...pedido,
            item: {
              Item: pedido.item.getCodigo(),
              tipo_item: pedido.item.getTipoItem(),
            },
          },
        });
      }
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }
}
