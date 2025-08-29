import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Divida } from "../entities/Divida.entity";
import { ICalculoDivida } from "../interfaces/ICalculoDivida";

type CalculaDividaPosPlanManualProps = {
    novoPlan: PlanejamentoTemporario,
    modo: 'INSERCAO' | 'REMOCAO'
}
export class CalculaDividaPosPlanManual implements ICalculoDivida {
    constructor(private props: CalculaDividaPosPlanManualProps) { }
    calc(): Partial<Divida>[] {
        return [
            {
                pedido: this.props.novoPlan.pedido,
                qtd: this.props.novoPlan.qtd * (this.props.modo === 'INSERCAO' ? -1 : 1),
                setor: { codigo: this.props.novoPlan.setor, nome: '' }
            }
        ]
    }
}