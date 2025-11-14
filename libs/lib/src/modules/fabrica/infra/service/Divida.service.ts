import { Inject } from '@nestjs/common';
import { Divida } from '../../@core/entities/Divida.entity';
import { Fabrica } from '../../@core/entities/Fabrica.entity';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { DividaSnapShotRepository } from '../repository/DividaSnapShot.repository';
import { DividaSnapShot } from '../../@core/entities/DividaSnapShot.entity';
import { SnapShotEstados } from '../../@core/enum/SnapShotEstados.enum';
import { FabricaService } from './Fabrica.service';
import { In } from 'typeorm';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { DividaOverWriteByPedido } from '../../@core/services/DividaOverWriteByPedido';

export class DividaService {
  constructor(
    @Inject(DividaSnapShotRepository)
    private dividaSnapShotRepository: DividaSnapShotRepository,
    @Inject(FabricaService) private fabricaService: FabricaService,
  ) {}

  async addDivida(
    fabrica: Fabrica,
    dividas: Divida[],
    tipo: SnapShotEstados,
    origem: 'manual' | 'calculo' | 'falha_alocacao',
  ): Promise<void> {
    const dividasSnapShot = dividas.map((divida) =>
      this.dividaSnapShotRepository.create({
        fabrica: fabrica,
        divida: divida,
        origem: origem,
        tipo:
          divida.qtd && divida.qtd === 0
            ? SnapShotEstados.delete
            : SnapShotEstados.base,
      }),
    );
    await this.dividaSnapShotRepository.save(dividasSnapShot);
  }

  async consultarDividaDoPedido(
    fabrica: Fabrica,
    ...pedido: Pedido[]
  ): Promise<DividaSnapShot[]> {
    const fabricas =
      await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
    const pedidosids = pedido.map((ped) => ped.id);
    const dividas = await this.dividaSnapShotRepository.find({
      where: {
        fabrica: {
          fabricaId: In(fabricas.map((fab) => fab.fabricaId)),
        },
        divida: {
          pedido: {
            id: In(pedidosids),
          },
        },
      },
    });
    return new DividaOverWriteByPedido().resolverOverwrite(dividas);
  }

  async consultarDividaTotalizadaDoPedido(
    fabrica: Fabrica,
    pedido: Pedido,
  ): Promise<{ qtd: number; setorCodigo: CODIGOSETOR }[]> {
    const fabricas =
      await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
    const dividaPorSetor = new Map<CODIGOSETOR, DividaSnapShot[]>();
    const dividas = await this.dividaSnapShotRepository.find({
      where: {
        fabrica: {
          fabricaId: In(fabricas.map((fab) => fab.fabricaId)),
        },
        divida: {
          pedido: {
            id: pedido.id,
          },
        },
      },
    });

    const dividasResolvidas = new DividaOverWriteByPedido().resolverOverwrite(
      dividas,
    );
    dividasResolvidas.forEach((divida) => {
      if (dividaPorSetor.has(divida.divida.setor.codigo)) {
        const dividas = dividaPorSetor.get(divida.divida.setor.codigo) || [];
        dividas.push(divida);
        dividaPorSetor.set(divida.divida.setor.codigo, dividas);
      } else {
        dividaPorSetor.set(divida.divida.setor.codigo, [divida]);
      }
    });

    const dividaMatrix: { qtd: number; setorCodigo: CODIGOSETOR }[] = [];

    for (const [k, divida] of dividaPorSetor.entries()) {
      const dividaSomada = divida.reduce(
        (total, dividaSnapShot) => total + dividaSnapShot.divida.qtd,
        0,
      );
      //nao adiciono na resposta dividas com o valor de 0
      if (dividaSomada > 0) {
        dividaMatrix.push({
          setorCodigo: k,
          qtd: dividaSomada,
        });
      }
    }
    return dividaMatrix;
  }

  async consultarDividaDaFabrica(fabrica: Fabrica): Promise<DividaSnapShot[]> {
    const fabricas =
      await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
    const dividas = await this.dividaSnapShotRepository.find({
      where: {
        fabrica: {
          fabricaId: In(fabricas.map((fab) => fab.fabricaId)),
        },
      },
    });
    return new DividaOverWriteByPedido().resolverOverwrite(dividas);
  }

  async removerDividaNaFabricaDoPedido(
    fabrica: Fabrica,
    pedido: Pedido,
  ): Promise<void> {
    const dividasNoBanco = await this.consultarDividaDoPedido(fabrica, pedido);
    const dividaParaApagar = dividasNoBanco.map((divida) => divida.copy());
    dividaParaApagar.forEach((d) => {
      d.tipo = SnapShotEstados.delete;
      d.fabrica = fabrica;
    });
    await this.dividaSnapShotRepository.save(dividaParaApagar);
  }
}
