import { format } from "date-fns";
import { PlanejamentoDiario } from "src/modules/planejamento/@core/entities/PlanejamentoDiario.entity";

export class PlanejamentoDiarioDisplay {
    static json(planejamentoDiario: PlanejamentoDiario[]): Array<any> | undefined{
        console.log(planejamentoDiario)
        const result: Array<{ dia: string, item: string, operacao: string, qtd: number, pedidoCode: string }> = [];
        const planejamentos = planejamentoDiario.sort((a, b) => b.dia.getTime() - a.dia.getTime())
        for (const planejamento of planejamentos) {
            const dia = planejamento.dia.toISOString();
            for (const g of planejamento.planejamentos) {
                result.push({
                    dia: format(dia, 'dd/MM/yyyy'),
                    item: g.item.toString(),
                    operacao: g.setor,
                    qtd: g.qtd,
                    pedidoCode: g.pedido.getCodigo()
                });
            }
            return result;
        }
    }
    static console(planejamentoDiario: PlanejamentoDiario[]): void {
            const data = PlanejamentoDiarioDisplay.json(planejamentoDiario);
            const diasUnicos = Array.from(new Set(data!.map(d => d.dia)));
            for (const dia of diasUnicos) {
                const linhas = data!.filter(d => d.dia === dia)
                    .map(({ item, operacao, qtd }) => ({ item, operacao, qtd }));
                console.log(`\nPlanejamento do dia: ${dia}`);
                console.table(linhas);
            }
    }
}