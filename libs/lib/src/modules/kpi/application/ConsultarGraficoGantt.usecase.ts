import { Inject, InternalServerErrorException } from "@nestjs/common";
import { GanttData, GanttLegendaDto, GetGanttInformationDto } from "@dto/GetGanttInformation.dto";
import { addMonths, isAfter, isSameDay, subMonths } from "date-fns";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { ConsultarGanttDTO } from "@dto/ConsultarGantt.dto";
import { ConsultaPlanejamentoService } from "@libs/lib/modules/fabrica/infra/service/ConsultaPlanejamentos.service";
import { FabricaService } from "@libs/lib/modules/fabrica/infra/service/Fabrica.service";
import { PlanejamentoOverWriteByPedidoService } from "@libs/lib/modules/fabrica/@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { ColorGenerator } from "@libs/lib/modules/shared/@core/classes/GeradorDeCor";
import { SetoresPalhetaDeCores } from "../@core/classes/GanttColors";
import { OqColorirGantt } from "../@core/enum/OqueColorirGantt.enum";
import { Planejamento } from "../../planejamento/@core/entities/Planejamento.entity";
import { CODIGOSETOR } from "../../planejamento/@core/enum/CodigoSetor.enum";

export class ConsultarGraficoGanttUseCase {
    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService,
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(ColorGenerator) private colorGenerator: ColorGenerator
    ) {
        for (const setores of Object.values(CODIGOSETOR)) {
            this.colorMapSetor.set(setores, this.colorGenerator.next())
        }
    }

    colorMapSetor = new Map<CODIGOSETOR, string>();

    colorMapPedido = new Map<number, string>();


    private calendario: Calendario = new Calendario();

    async consultar(dto: ConsultarGanttDTO): Promise<GetGanttInformationDto> {
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
                if (!this.colorMapPedido.has(pedidoId)) {
                    this.colorMapPedido.set(pedidoId, this.colorGenerator.next());
                }
            });
            //

            const data: GanttData[] = sortedItens.map((i) => {
                return {
                    id: `${i.planejamentoSnapShotId}`,
                    color: dto.colorir === OqColorirGantt.OPERACAO ? this.colorMapSetor.get(i.planejamento.setor.codigo) : this.colorMapPedido.get(i.planejamento.pedido.id),
                    name: `${i.planejamento.planejamentoId} | ${i.planejamento.item.getCodigo()} | ${i.planejamento.setor.codigo} | pedido: ${i.planejamento.pedido.codigo} | planejado : ${i.planejamento.qtd} `,
                    start: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 0)),
                    end: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 1)),
                    progress: 0, //i.produzido === 0 ? 0 : Number(((i.produzido / i.planejamento.qtd) * 100).toFixed(2)),
                    custom_class: this.ehAtrasado(i.planejamento)
                        ? "gantt-atrasado"
                        : "", // ou a classe padrão que já usava
                    dependencies: JSON.stringify(PlanejamentoResponseDTO.fromEntity(i.planejamento))
                };
            });
            const legenda = dto.colorir === OqColorirGantt.OPERACAO ? this.legendaDeOperacao() : this.legendaDePedido()
            return {
                data,
                legenda
            }

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error);
        }
    }

    private ehAtrasado(planejamento: Planejamento): boolean {
        return isAfter(planejamento.dia, planejamento.pedido.getSafeDate());
    }

    private legendaDePedido(): GanttLegendaDto[] {
        const legenda: GanttLegendaDto[] = [];
        for (const item of this.colorMapPedido.entries()) {
            legenda.push({
                legenda: String(item[0]),
                cor: item[1]
            })
        }
        return legenda;
    }

    private legendaDeOperacao(): GanttLegendaDto[] {
        const legenda: GanttLegendaDto[] = [];
        for (const item of Object.entries(SetoresPalhetaDeCores.colors)) {
            legenda.push({
                legenda: item[0],
                cor: item[0]
            })
        }
        return legenda;
    }
}