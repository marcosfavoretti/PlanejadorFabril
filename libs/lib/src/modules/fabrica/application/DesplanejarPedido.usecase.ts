import { Inject, InternalServerErrorException } from '@nestjs/common';
import { BuscaPedidosService } from '../infra/service/BuscaPedidos.service';
import { FabricaService } from '../infra/service/Fabrica.service';
import { ConsultaPlanejamentoService } from '../infra/service/ConsultaPlanejamentos.service';
import { PlanejamentoOverWriteByPedidoService } from '../@core/services/PlanejamentoOverWriteByPedido.service';
import { EfetivaPlanejamentoService } from '../infra/service/EfetivaPlanejamento.service';
import { DesplanejarPedidoDto } from '@libs/lib/dtos/DesplanejarPedido.dto';
import { ForkFabricaService } from '../infra/service/ForkFabrica.service';
import { User } from '../../user/@core/entities/User.entity';
import { MergeRequestService } from '../infra/service/MergeRequest.service';
import { isBefore, startOfToday, startOfTomorrow } from 'date-fns';
import { PedidoService } from '../../pedido/infra/service/Pedido.service';

export class DesplanejarPedidoUseCase {
  constructor(
    @Inject(FabricaService) private fabricaService: FabricaService,
    @Inject(BuscaPedidosService) private buscarPedidos: BuscaPedidosService,
    @Inject(PedidoService) private pedidoService: PedidoService,
    @Inject(ConsultaPlanejamentoService)
    private consultaPlanejamento: ConsultaPlanejamentoService,
    @Inject(ForkFabricaService) private forkFabricaService: ForkFabricaService,
    @Inject(EfetivaPlanejamentoService)
    private removeSnapShots: EfetivaPlanejamentoService,
    @Inject(MergeRequestService)
    private mergeRequestService: MergeRequestService,
  ) {}

  async desplanejar(dto: DesplanejarPedidoDto, user: User): Promise<void> {
    try {
      const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
      if (!fabrica) throw new Error('Faltando a fabrica principal');
      const pedidos = await this.buscarPedidos.pedidosNaFabrica(fabrica);
      if (
        !this.verificaIdsPlanejados(
          dto.pedidoIds,
          pedidos.map((ped) => ped.id),
        )
      )
        throw new Error('Ids de pedido invalidos foram inputados');
      const pedidosConvertidos = pedidos.filter((ped) =>
        dto.pedidoIds.includes(ped.id),
      );
      const planejamentosSnapShot =
        await this.consultaPlanejamento.consultaPorPedido(
          fabrica,
          pedidosConvertidos,
          new PlanejamentoOverWriteByPedidoService(),
        );
      const primeiroPlanejamento = planejamentosSnapShot.sort(
        (a, b) => a.planejamento.dia.getTime() - b.planejamento.dia.getTime(),
      )[0];
      if (isBefore(primeiroPlanejamento.planejamento.dia, startOfTomorrow())) {
        throw new Error(
          'o planejamento ja foi realizado, impossivel apagar o pedido',
        );
      }
      // const forkDaFabrica = await this.forkFabricaService.fork({
      //     fabrica: fabrica,
      //     isPrincipal: false,
      //     user: user,
      //     forceCheckPoint: false
      // })
      // await this.fabricaService.saveFabrica(forkDaFabrica);
      await this.removeSnapShots.remove(fabrica, ...planejamentosSnapShot);
      // await this.mergeRequestService.createMerge(forkDaFabrica, user);
      const pedidosRemovidos = pedidosConvertidos.map((pedido) => ({
        ...pedido,
        processado: false,
      }));
      await this.pedidoService.savePedido(pedidosRemovidos);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private verificaIdsPlanejados(
    idsInput: number[],
    idsBanco: number[],
  ): boolean {
    const response = idsInput.every((inputPedido) =>
      idsBanco.includes(inputPedido),
    );
    return response;
  }
}
