import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Divida } from "../entities/Divida.entity";
import { ICalculoDivida } from "../interfaces/ICalculoDivida";
import { isAfter } from "date-fns";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";

type CalculaDividaDoPlanejamentoProps = {
  pedido: Pedido,
  planejamentos: PlanejamentoTemporario[],
}
export class CalculaDividaDoPlanejamento implements ICalculoDivida {

  constructor(private props: CalculaDividaDoPlanejamentoProps) { }

  calc(): Partial<Divida>[] {
    const divida = this.props.planejamentos.filter(plan =>
      isAfter(plan.dia, this.props.pedido.getSafeDate())
    ); return divida.map(plan => ({
      pedido: this.props.pedido,
      qtd: plan.qtd,
      setor: { codigo: plan.setor, nome: '' }//IMPROVE
    }));
  }
}
