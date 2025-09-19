import { Inject, InternalServerErrorException } from "@nestjs/common";
import { GanttData, GanttLegendaDto, GetGanttInformationDto } from "@dto/GetGanttInformation.dto";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { ConsultarGanttDTO } from "@dto/ConsultarGantt.dto";
import { ConsultaPlanejamentoService } from "@libs/lib/modules/fabrica/infra/service/ConsultaPlanejamentos.service";
import { FabricaService } from "@libs/lib/modules/fabrica/infra/service/Fabrica.service";
import { PlanejamentoOverWriteByPedidoService } from "@libs/lib/modules/fabrica/@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { ColorGenerator } from "@libs/lib/modules/shared/@core/classes/GeradorDeCor";
import { OqColorirGantt } from "../@core/enum/OqueColorirGantt.enum";
import { CODIGOSETOR } from "../../planejamento/@core/enum/CodigoSetor.enum";
import { addMonths, subDays } from "date-fns";

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

    colorMapPedido = new Map<string, string>();

    private calendario: Calendario = new Calendario();

    async consultar(dto: ConsultarGanttDTO): Promise<GetGanttInformationDto> {
        try {
            const today = new Date();
            const lastDay = addMonths(today, 2);
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId)
            //
            const itens = await this.consultaPlanejamentoService.consultaPlanejamentoDia(
                fabrica,
                subDays(today, 1),
                new PlanejamentoOverWriteByPedidoService(),
                lastDay
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
                // const pedidoId = i.planejamento.pedido.id;
                const pedidoId = i.planejamento.pedido.codigo;
                if (!this.colorMapPedido.has(pedidoId)) {
                    this.colorMapPedido.set(pedidoId, this.colorGenerator.next());
                }
            });
            //gera as tasks para o gantt do frontend
            const data: GanttData[] = sortedItens.map((i) => {
                const pedidoChave = i.planejamento.pedido.codigo;
                const cor = dto.colorir === OqColorirGantt.OPERACAO ? this.colorMapSetor.get(i.planejamento.setor.codigo) : this.colorMapPedido.get(pedidoChave)
                const customClass = i.ehAtrasado() ? "gantt-atrasado" : undefined;
                return {
                    id: `${i.planejamentoSnapShotId}`,
                    color: cor,
                    // name: `id: ${i.planejamento.pedido.id}| pedido: ${i.planejamento.pedido.codigo} | ${i.planejamento.item.getTipoItem().slice(0, 25)} | planejado : ${i.planejamento.qtd} | setor : ${i.planejamento.setor.codigo} `,
                    name: `${i.planejamento.pedido.id} • ${i.planejamento.pedido.codigo} • ${i.planejamento.item.tipo_item} • qtd : ${i.planejamento.qtd}`,
                    start: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 0)),
                    end: this.calendario.format(this.calendario.addDays(i.planejamento.dia, 1)),
                    progress: 0,
                    custom_class: customClass,
                    dependencies: JSON.stringify(PlanejamentoResponseDTO.fromEntity(i.planejamento))
                } as GanttData;
            });
            //pega a legenda de cores
            const legenda = dto.colorir === OqColorirGantt.OPERACAO ?
                this.legendaDeOperacao() : this.legendaDePedido();
            //
            return {
                data,
                legenda
            }
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
                cor: item[1]
            })
        }
        return legenda;
    }

private legendaDeOperacao(): GanttLegendaDto[] {
    const legenda: GanttLegendaDto[] = [];

    for (const [setorValue, color] of this.colorMapSetor.entries()) {
        const enumEntry = Object.entries(CODIGOSETOR).find(([key, value]) => value === setorValue);
        if (enumEntry) {
            const [enumKey] = enumEntry; // pega a chave do enum
            legenda.push({
                legenda: enumKey, // ou enumEntry[0]
                cor: color
            });
        }
    }

    return legenda;
}
}