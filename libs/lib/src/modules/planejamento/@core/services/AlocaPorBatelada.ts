import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { AlocacaoComDependenciaProps, AlocacaoSemDependenciaProps, MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { VerificaBatelada } from "@libs/lib/modules/fabrica/@core/classes/VerificaBatelada";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";

export class AlocaPorBatelada
    extends MetodoDeAlocacao {

    constructor(
        private readonly numMaxBatelada: number,
        gerenciador: IGerenciadorPlanejamentConsulta,
        public selecionador: ISelecionarItem
    ) {
        console.log(`Batelada setada para ${numMaxBatelada}!`)
        if (!numMaxBatelada) throw new Error('um valor limite tem que ser informado');
        super(gerenciador, selecionador);
    }

    private ordenaPorMaisNovo(): (a, b) => number {
        return (a, b) => b - a;
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaBatelada(this.numMaxBatelada);
    }

    //para tirar isso deveria aplicar interfaces de maneira mais inteligente. E nao template pattern.:.refatoração
    protected async alocacao(prosp: AlocacaoSemDependenciaProps): Promise<PlanejamentoTemporario[]> {
        throw new Error('NOT_IMPLEMENTED');
    }

    protected diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        throw new Error('NOT_IMPLEMENTED');
    }
    //

    protected async alocacaoComDependencia(props: AlocacaoComDependenciaProps): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = props.pedido.getItem().getLeadtime(props.setor);
        const planejamentosProxOrdenados = props.planDoProximoSetor.sort(this.ordenaPorMaisNovo());
        let restante = props.pedido.getLote();
        let jaAlocados: number = 0;

        for (const necessidade of planejamentosProxOrdenados) {
            if (restante <= 0) break;

            const precisoAlocar = necessidade.qtd;//planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            let dataLimite = leadtime > 0 ? this.calendario.ultimoDiaUtil(
                this.calendario.subDays(necessidade.dia, leadtime),
                true
            ) : necessidade.dia;

            const datasParaProgramar = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                dataLimite,
                props.setor,
                props.pedido.item,
                precisoAlocar,
                new VerificaBatelada(this.numMaxBatelada),
                props.planejamentoFabril,
                planejamentosTemporarios
            );


            for (const [data, _qtd] of datasParaProgramar.entries()) {
                const possoAlocarNesseDia = _qtd;
                const qtdParaAlocar = Math.min(
                    restante,
                    necessidade.qtd,
                    possoAlocarNesseDia,
                );
                if (qtdParaAlocar <= 0) continue;
                planejamentosTemporarios.push({
                    dia: data,
                    item: props.itemContext,
                    pedido: props.pedido,
                    qtd: qtdParaAlocar,
                    setor: props.setor,
                });
                restante -= qtdParaAlocar;
                jaAlocados += qtdParaAlocar;
                if (restante <= 0) break; // encerramento antecipado
            }
        }
        return planejamentosTemporarios;
    }

}