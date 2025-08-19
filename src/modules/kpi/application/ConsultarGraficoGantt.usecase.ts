import { Inject, InternalServerErrorException } from "@nestjs/common";
import { GetGanttInformationDto } from "src/delivery/dtos/GetGanttInformation.dto";
import { addMonths, set, subMonths } from "date-fns";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { ConsultarGanttDTO } from "src/delivery/dtos/ConsultarGantt.dto";
import { ConsultaPlanejamentoService } from "src/modules/fabrica/infra/service/ConsultaPlanejamentos.service";
import { FabricaService } from "src/modules/fabrica/infra/service/Fabrica.service";
import { PlanejamentoOverWriteByPedidoService } from "src/modules/fabrica/@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoResponseDTO } from "src/delivery/dtos/PlanejamentoResponse.dto";
import { ColorGenerator } from "src/modules/shared/@core/classes/GeradorDeCor";
import { SetoresPalhetaDeCores } from "../@core/classes/GanttColors";

export class ConsultarGraficoGanttUseCase {
    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(FabricaService) private fabricaService: FabricaService
    ) { }

    colorMap = new Map<number, string>();
    colorGenerator = new ColorGenerator();

    private calendario: Calendario = new Calendario();
    async consultar(dto: ConsultarGanttDTO): Promise<GetGanttInformationDto[]> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId)
            const today = new Date();
            const finalDate = addMonths(today, 2);
            const initialDay = subMonths(today, 1);
            const itens = await this.consultaPlanejamentoService.consultaPlanejamentoDia(
                fabrica,
                initialDay,
                new PlanejamentoOverWriteByPedidoService(),
                finalDate,
            );

            //ordena por ordem os pedidos do menor para o maior & codigo do setor
            const sortedItens = itens.sort(
                (a, b) => {
                    const dayDiff = a.planejamento.dia.getTime() - b.planejamento.dia.getTime();
                    if (dayDiff !== 0) return dayDiff;
                    if (a.planejamento.setor.codigo < b.planejamento.setor.codigo) return -1;
                    if (a.planejamento.setor.codigo > b.planejamento.setor.codigo) return 1;
                    return 0;
                }
            );

            //seta a cor dos pedidos
            sortedItens.forEach((i) => {
                const pedidoId = i.planejamento.pedido.id;
                if (!this.colorMap.has(pedidoId)) {
                    this.colorMap.set(pedidoId, this.colorGenerator.next());
                }
            });

            return sortedItens.map((i) => {
                return {
                    id: `${i.planejamentoSnapShotId}`,
                    // color: this.colorMap.get(i.planejamento.pedido.id),
                    color: SetoresPalhetaDeCores.colors[i.planejamento.setor.codigo],
                    name: `${i.planejamento.item.getCodigo()} | ${i.planejamento.setor.codigo} | pedido: ${i.planejamento.pedido.codigo} | planejado : ${i.planejamento.qtd} `,
                    start: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 0)),
                    end: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 1)),
                    progress: 0, //i.produzido === 0 ? 0 : Number(((i.produzido / i.planejamento.qtd) * 100).toFixed(2)),
                    custom_class: 'bg-black',
                    dependencies: JSON.stringify(PlanejamentoResponseDTO.fromEntity(i.planejamento))
                };
            });
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error);
        }
    }
}