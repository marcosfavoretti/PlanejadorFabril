import { Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  GanttData,
  GanttLegendaDto,
  GetGanttInformationDto,
} from '@dto/GetGanttInformation.dto';
import { Calendario } from '@libs/lib/modules/shared/@core/classes/Calendario';
import { ConsultarGanttDTO } from '@dto/ConsultarGantt.dto';
import { ConsultaPlanejamentoService } from '@libs/lib/modules/fabrica/infra/service/ConsultaPlanejamentos.service';
import { FabricaService } from '@libs/lib/modules/fabrica/infra/service/Fabrica.service';
import { PlanejamentoOverWriteByPedidoService } from '@libs/lib/modules/fabrica/@core/services/PlanejamentoOverWriteByPedido.service';
import { PlanejamentoResponseDTO } from '@dto/PlanejamentoResponse.dto';
import { ColorGenerator } from '@libs/lib/modules/shared/@core/classes/GeradorDeCor';
import { OqColorirGantt } from '../@core/enum/OqueColorirGantt.enum';
import { CODIGOSETOR } from '../../planejamento/@core/enum/CodigoSetor.enum';
import { addMonths, subDays } from 'date-fns';
import { SetorChainFactoryService } from '../../fabrica/@core/services/SetorChainFactory.service';

export class ConsultarGraficoGanttUseCase {
  constructor(
    @Inject(ConsultaPlanejamentoService)
    private consultaPlanejamentoService: ConsultaPlanejamentoService,
    @Inject(SetorChainFactoryService)
    private setorChainFactoryService: SetorChainFactoryService,
    @Inject(FabricaService) private fabricaService: FabricaService,
    @Inject(ColorGenerator) private colorGenerator: ColorGenerator,
  ) {
    for (const setores of Object.values(CODIGOSETOR)) {
      this.colorMapSetor.set(setores, this.colorGenerator.next());
    }
  }

  colorMapSetor = new Map<CODIGOSETOR, string>();
  colorMapPedido = new Map<string, string>();

  private calendario: Calendario = new Calendario();

  private orderBySetoresChain(a: CODIGOSETOR, b: CODIGOSETOR): number {
    const setores = this.setorChainFactoryService.getSetoresAsList();
    const indexA = setores.indexOf(a);
    const indexB = setores.indexOf(b);
    if (indexA < indexB) return -1;
    if (indexA > indexB) return 1;
    return 0;
  }

  async consultar(dto: ConsultarGanttDTO): Promise<GetGanttInformationDto> {
    try {
      const today = new Date();
      const lastDay = addMonths(today, 2);
      const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);

      const itens =
        await this.consultaPlanejamentoService.consultaPlanejamentoDia(
          fabrica,
          subDays(today, 1),
          new PlanejamentoOverWriteByPedidoService(),
          lastDay,
        );

      // Ordena primeiro por dia, e depois pela ordem lógica dos setores
      const sortedItens = itens.sort((a, b) => {
        const dayDiff =
          a.planejamento.dia.getTime() - b.planejamento.dia.getTime();
        if (dayDiff !== 0) return dayDiff;

        // CORREÇÃO: A chamada para a função de ordenação secundária precisa ser retornada.
        return this.orderBySetoresChain(
          a.planejamento.setor.codigo,
          b.planejamento.setor.codigo,
        );
      });

      // Seta a cor dos pedidos
      sortedItens.forEach((i) => {
        const pedidoId = String(i.planejamento.pedido.id);
        if (!this.colorMapPedido.has(pedidoId)) {
          this.colorMapPedido.set(pedidoId, this.colorGenerator.next());
        }
      });

      // Gera as tasks para o gantt do frontend
      const data: GanttData[] = sortedItens.map((i) => {
        const pedidoChave = String(i.planejamento.pedido.id);
        const cor =
          dto.colorir === OqColorirGantt.OPERACAO
            ? this.colorMapSetor.get(i.planejamento.setor.codigo)
            : this.colorMapPedido.get(pedidoChave);
        const customClass = i.ehAtrasado() ? 'gantt-atrasado' : undefined;
        return {
          id: `${i.planejamentoSnapShotId}`,
          color: cor,
          name: `${i.planejamento.pedido.id} • ${i.planejamento.pedido.codigo} • ${i.planejamento.item.tipo_item} • qtd : ${i.planejamento.qtd}`,
          start: this.calendario.format(
            this.calendario.addDays(i.planejamento.dia, 0),
          ),
          end: this.calendario.format(
            this.calendario.addDays(i.planejamento.dia, 1),
          ),
          progress: 0,
          custom_class: customClass,
          dependencies: JSON.stringify(
            PlanejamentoResponseDTO.fromEntity(i.planejamento),
          ),
        } as GanttData;
      });

      // Pega a legenda de cores, agora ordenada corretamente
      const legenda =
        dto.colorir === OqColorirGantt.OPERACAO
          ? this.legendaDeOperacao()
          : this.legendaDePedido();

      return {
        data,
        legenda,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private legendaDePedido(): GanttLegendaDto[] {
    const legenda: GanttLegendaDto[] = [];
    for (const item of this.colorMapPedido.entries()) {
      legenda.push({
        legenda: String(item[0]),
        cor: item[1],
      });
    }
    return legenda;
  }

  private legendaDeOperacao(): GanttLegendaDto[] {
    // CORREÇÃO: Gera a legenda baseando-se na ordem da cadeia de setores para garantir consistência.
    const legenda: GanttLegendaDto[] = [];
    const setoresOrdenados = this.setorChainFactoryService.getSetoresAsList();

    for (const setor of setoresOrdenados) {
      const cor = this.colorMapSetor.get(setor);
      if (cor) {
        // Encontra a chave do Enum (ex: 'EXTRUSAO') a partir do seu valor (ex: 'ext')
        const enumKey = Object.keys(CODIGOSETOR).find(
          (key) => CODIGOSETOR[key as keyof typeof CODIGOSETOR] === setor,
        );
        legenda.push({
          legenda: enumKey || setor, // Usa a chave do Enum se encontrar, senão o valor
          cor: cor,
        });
      }
    }
    return legenda;
  }
}
