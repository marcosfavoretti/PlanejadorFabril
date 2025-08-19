import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { Divida } from "../entities/Divida.entity";
import { ICalculoDivida } from "../interfaces/ICalculoDivida";
import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { isBefore } from "date-fns";

type CalculaDividaDoPlanejamentoProps = {
    pedido: Pedido,
    planejamentos: Planejamento[],
}

export class CalculaDividaAtrasoService
    implements ICalculoDivida {
    constructor(private props: CalculaDividaDoPlanejamentoProps) { }

    calc(): Partial<Divida>[] {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const dividas = this.props.planejamentos.filter(plan =>
            isBefore(plan.dia, amanha)
        );
        return dividas.map((d) => ({ ...d }));
    }

}