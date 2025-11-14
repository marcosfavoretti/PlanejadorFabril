import { Inject, Injectable, Logger } from '@nestjs/common';
import { Mudancas, TipoMudancas } from '../classes/Mudancas';
import { Fabrica } from '../entities/Fabrica.entity';
import { IComparaMudancasFabrica } from '../interfaces/IComparaMudancasFabricas';
import { BuscaPedidosService } from '../../infra/service/BuscaPedidos.service';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { ok } from 'assert';

@Injectable()
export class MudancaPedido implements IComparaMudancasFabrica {
  constructor(
    @Inject(BuscaPedidosService)
    private buscaPedidosService: BuscaPedidosService,
  ) {}

  async compara(fabricaA: Fabrica, fabricaB: Fabrica): Promise<Mudancas[]> {
    const [pedidosA, pedidosB] = await Promise.all([
      this.buscaPedidosService.pedidosNaFabrica(fabricaA),
      this.buscaPedidosService.pedidosNaFabrica(fabricaB),
    ]);
    const naoTemEmB = pedidosA.filter(
      (a) => !pedidosB.map((b) => b.id).includes(a.id),
    );
    const naoTemEmA = pedidosB.filter(
      (B) => !pedidosA.map((a) => a.id).includes(B.id),
    );
    const resultadoB = naoTemEmB.map(
      (b) =>
        new Mudancas(TipoMudancas.INSERCAO, Pedido.name, '', b.id.toString()),
    );
    const resultadoA = naoTemEmA.map(
      (b) =>
        new Mudancas(TipoMudancas.REMOCAO, Pedido.name, b.id.toString(), ''),
    );
    Logger.log(
      pedidosA.map((a) => a.id),
      pedidosB.map((a) => a.id),
    );
    return resultadoA.concat(resultadoB);
  }
}
