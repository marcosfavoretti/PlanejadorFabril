import { Inject } from "@nestjs/common";
import { retry } from "rxjs";
import { GetMercadosEntreSetoresTabelaDto } from "@dto/GetMercadosEntreSetores.dto";
import { Mercado } from "@libs/lib/modules/planejamento/@core/classes/Mercado";
import { TabelaProducaoService } from "@libs/lib/modules/planejamento/infra/services/TabelaProducao.service";

export class LinkMercadoComProdService {
    @Inject(TabelaProducaoService) private tabelaProducaoService: TabelaProducaoService

    async link(logEntries: [Date, Mercado[]][]): Promise<GetMercadosEntreSetoresTabelaDto[]> {
        const response: GetMercadosEntreSetoresTabelaDto[] = [];
        const datesSet = new Set(logEntries.map((l) => l[0]).sort((a, b) => a.getTime() - b.getTime()))
        const datesArr = Array.from(datesSet);
        const tabelaProducao = await this.tabelaProducaoService.consultarTabelaPorDia(
            datesArr[0],
            datesArr[datesArr.length - 1]
        )
        for (const [dia, mercados] of logEntries) {
            for (const mercado of mercados) {
                for (const [partcode, qtd] of mercado.mercadoEntries()) {
                    response.push({
                        dia: dia,
                        item: partcode,
                        operacao: mercado.getSetor().codigo,
                        planejado: tabelaProducao.find(
                            t => t.planejamento.dia.getTime() === dia.getTime() &&
                                t.planejamento.item.getCodigo() === partcode &&
                                t.planejamento.setor.codigo === mercado.getSetor().codigo
                        )?.planejamento.qtd || 0,
                        produzido: tabelaProducao.find(
                            t => t.planejamento.dia.getTime() === dia.getTime() &&
                                t.planejamento.item.getCodigo() === partcode &&
                                t.planejamento.setor.codigo === mercado.getSetor().codigo
                        )?.produzido || 0,
                        qtdmercado: qtd
                    })
                }
            }
        }
        return response;
    }
}