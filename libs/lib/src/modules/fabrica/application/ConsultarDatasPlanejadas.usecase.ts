import { Inject } from '@nestjs/common';
import { PlanejamentoRepository } from '../../planejamento/infra/repositories/Planejamento.repo';
import { ConsultaPlanejamentoService } from '../infra/service/ConsultaPlanejamentos.service';
import { FabricaService } from '../infra/service/Fabrica.service';
import { PlanejamentoOverWriteByPedidoService } from '../@core/services/PlanejamentoOverWriteByPedido.service';

export class ConsultarDatasPlanejadasUseCase {
  @Inject(PlanejamentoRepository)
  private planejamentoRepository: PlanejamentoRepository;
  @Inject(FabricaService) private fabricaService: FabricaService;
  @Inject(ConsultaPlanejamentoService)
  private consultaPlanejamentoService: ConsultaPlanejamentoService;

  async consultar(): Promise<Date[]> {
    try {
      //deixa dinamico se vai puxar da principal ou nao por uma dto
      const fabricaAtual = await this.fabricaService.consultaFabricaPrincipal();
      if (!fabricaAtual)
        throw new Error('não foi possivel cosultar a fabrica atual');
      const planejamentoAtual =
        await this.consultaPlanejamentoService.consultaPlanejamentoAtual(
          fabricaAtual,
          new PlanejamentoOverWriteByPedidoService(),
        );
      // const planejamentos = await this.planejamentoRepository.find({ order: { dia: 'asc' } });

      const datas = planejamentoAtual.map((plan) =>
        plan.planejamento.dia instanceof Date
          ? plan.planejamento.dia.toISOString()
          : new Date(plan.planejamento.dia).toISOString(),
      );

      const uniqueDatas = Array.from(new Set(datas)).map(
        (dateStr) => new Date(dateStr),
      );

      return uniqueDatas;
    } catch (error) {
      throw error;
    }
  }
}
