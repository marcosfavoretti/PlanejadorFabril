import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject, Logger } from '@nestjs/common';
import { PlanejarPedidoUseCase } from '@libs/lib/modules/fabrica/application';
import { PedidoService } from '@libs/lib/modules/pedido/infra/service/Pedido.service';

@Processor('planejamento')
export class PlanejamentoWorker {
  constructor(
    @Inject(PlanejarPedidoUseCase)
    private planejarPedidoUseCase: PlanejarPedidoUseCase,
    @Inject(PedidoService) private pedidoService: PedidoService,
  ) {}
  private logger = new Logger();

  @Process('planejar')
  async handle(job: Job<{ pedidoId: string }>) {
    try {
      console.log('Processando pedido', job.data.pedidoId);
      const pedido = await this.pedidoService.consultarPedidos([
        Number(job.data.pedidoId),
      ]);

      //
      await this.planejarPedidoUseCase.planeje({
        pedidoIds: [Number(job.data.pedidoId)],
      });
      //
    } catch (error) {
      console.error('Erro no pedido', job.data.pedidoId, error);
      return Promise.resolve();
    } finally {
      this.logger.log('Work end 👷👌');
    }
  }
}
