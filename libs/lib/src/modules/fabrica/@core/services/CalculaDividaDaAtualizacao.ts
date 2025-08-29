import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { Divida } from "../entities/Divida.entity";
import { ICalculoDivida } from "../interfaces/ICalculoDivida";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";

type CalculaDividaDaAtualizacaoProps = {
    planejamentoOrigial: Planejamento,
    planejamentoNovo: PlanejamentoTemporario,
    pedido: Pedido,
}
export class CalculaDividaDaAtualizacao implements ICalculoDivida {

    constructor(private props: CalculaDividaDaAtualizacaoProps) { }

    
    calc(): Partial<Divida>[] {
        const qtdAntes = this.props.planejamentoOrigial.qtd;
        const qtdAtual = this.props.planejamentoNovo.qtd;
        console.log(this.props.planejamentoNovo, this.props.planejamentoOrigial)
        return [{
            pedido: this.props.pedido,
            qtd: qtdAntes - qtdAtual,
            setor: this.props.planejamentoOrigial.setor
        }]
    }

}