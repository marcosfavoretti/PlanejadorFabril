import { Inject } from "@nestjs/common";
import { GetGanttInformationDto } from "src/delivery/dtos/GetGanttInformation.dto";
import { addMonths, subMonths } from "date-fns";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { SetoresPalhetaDeCores } from "src/modules/kpi/@core/classes/GanttColors";
import { TabelaProducaoService } from "src/modules/producao-simulacao/infra/services/TabelaProducao.service";

export class ConsultarGraficoGanttUseCase {
    @Inject(TabelaProducaoService) tabelaProducaoService: TabelaProducaoService;
    private calendario: Calendario = new Calendario();
    async consultar(): Promise<GetGanttInformationDto[]> {
        const today = new Date();
        const finalDate = addMonths(today, 2);
        const initialDay = subMonths(today, 1);
        console.log(finalDate, initialDay)
        const itens = await this.tabelaProducaoService.consultarTabelaPorDia(initialDay, finalDate);
        // console.log(itens);
        console.log(itens);
        return itens.map((i, $index) => {
            return {
                id: `${i.id}`,
                color: SetoresPalhetaDeCores.colors[i.planejamento.setor],
                name: `${i.planejamento.item.getCodigo()} | ${i.planejamento.setor} | pedido: ${i.planejamento.pedido.codigo} | planejado : ${i.planejamento.qtd} `,
                start: this.calendario.format(this.calendario.addDays(i.date_planej, 0)),
                end: this.calendario.format(this.calendario.addDays(i.date_planej, 1)),
                progress: i.produzido === 0 ? 0 : Number(((i.produzido / i.planejamento.qtd) * 100).toFixed(2)),
                custom_class: 'bg-black'
            }
        })
    }
}