import { Inject, Logger } from "@nestjs/common";
import { ConsultaPlanejamentoService } from "../../infra/service/ConsultaPlanejamentos.service";
import { IComparaMudancasFabrica } from "../interfaces/IComparaMudancasFabricas";
import { Fabrica } from "../entities/Fabrica.entity";
import { PlanejamentoOverWriteByPedidoService } from "./PlanejamentoOverWriteByPedido.service";
import { Mudancas, TipoMudancas } from "../classes/Mudancas";
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { format } from "date-fns";

export class MudancaPlanejamento implements IComparaMudancasFabrica {

    constructor(
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService
    ) { }

    async compara(fabricaA: Fabrica, fabricaB: Fabrica): Promise<Mudancas[]> {
        const strategy = new PlanejamentoOverWriteByPedidoService();

        const [planA, planB] = await Promise.all([
            this.consultaPlanejamentoService.consultaPlanejamentoAtual(fabricaA, strategy),
            this.consultaPlanejamentoService.consultaPlanejamentoAtual(fabricaB, strategy),
        ]);

        const getKey = (p: Planejamento): string => `${p.item.Item}|${p.dia.toISOString()}|${p.setor.codigo}|${p.pedido.id}`;
        const logKey = (p: Planejamento): string => `dia: ${format(p.dia, 'dd/MM/yyyy')}\n item: ${p.item.tipo_item}\n qtd: ${p.qtd}\n setor: ${p.setor.nome}`
        const mapB = new Map(planB.map(p => [getKey(p.planejamento), p]));
        const mapA = new Map(planA.map(p => [getKey(p.planejamento), p]));

        const remocoes = planA
            .filter(pA => !mapB.has(getKey(pA.planejamento)))
            .map(pA => new Mudancas(TipoMudancas.INSERCAO, 'Planejamento','', logKey(pA.planejamento)));

        const insercoes = planB
            .filter(pB => !mapA.has(getKey(pB.planejamento)))
            .map(pB => new Mudancas(TipoMudancas.REMOCAO, 'Planejamento', logKey(pB.planejamento), ''));

        return [...remocoes, ...insercoes];
    }
}