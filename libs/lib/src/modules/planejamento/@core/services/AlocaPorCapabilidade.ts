import { AlocacaoComDependenciaProps, AlocacaoSemDependenciaProps, MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentConsulta } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { VerificaCapabilidade } from "@libs/lib/modules/fabrica/@core/classes/VerificaCapabilidade";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { ISelecionarItem } from "@libs/lib/modules/fabrica/@core/interfaces/ISelecionarItem";

export class AlocaPorCapabilidade extends MetodoDeAlocacao {

    constructor(
        gerenciador: IGerenciadorPlanejamentConsulta,
        selecionador: ISelecionarItem
    ) {
        super(gerenciador, selecionador);
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaCapabilidade(pedido.item, codigoSetor);
    }

    protected async diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        try {
            const dias = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                fabrica,
                pedido.getSafeDate(),
                setor,
                pedido.item,
                pedido.lote,
                new VerificaCapabilidade(pedido.item, setor)
            );
            return dias;
        } catch (error) {
            console.error(error);
            throw new Error(`Problema a consultar as datas para adiantar a producao\n${error}`)
        }
    }

    private sortStrategy(): (a, b) => number {
        return (a, b) => b - a;
    }

    protected async alocacaoComDependencia(
        props: AlocacaoComDependenciaProps
    ): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = props.pedido.getItem().getLeadtime(props.setor);
        const planejamentosProxOrdenados = props.planDoProximoSetor.sort(this.sortStrategy());
        let restante = props.pedido.getLote();
        
        for (const necessidade of planejamentosProxOrdenados) {
            if (restante <= 0) break;

            const precisoAlocar = necessidade.qtd;
            //planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            let dataLimite = leadtime > 0 ? this.calendario.ultimoDiaUtil(
                this.calendario.subDays(necessidade.dia, leadtime),
                true
            ) : necessidade.dia;

            const datas = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                props.fabrica, dataLimite, props.setor, props.pedido.item, precisoAlocar, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosTemporarios
            );

            const qtdMatriz: number[] = [];

            for (const data of datas) {
                const response = await this.gerenciadorPlan.possoAlocarQuantoNoDia(props.fabrica, data, props.setor, props.pedido.item, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosTemporarios);
                qtdMatriz.push(response);
            }

            for (const [index, data] of datas.entries()) {
                const possoAlocarNesseDia = qtdMatriz[index];
                const qtdParaAlocar = Math.min(
                    restante,
                    possoAlocarNesseDia,
                    props.pedido.item.capabilidade(props.setor)
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
                if (restante <= 0) break; // encerramento antecipado
            }
        }
        return planejamentosTemporarios;
    }

    protected async alocacao(props: AlocacaoSemDependenciaProps): Promise<PlanejamentoTemporario[]> {
        try {
            const planejamentosDoPedido: PlanejamentoTemporario[] = [];
            let restante = props.pedido.getLote();
            let i = 0;
            props.dias.sort((a, b) => b.getTime() - a.getTime());
            while (restante > 0 && i < props.dias.length) {
                let dia = props.dias[i];

                let capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(props.fabrica, dia, props.setor, props.pedido.item, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosDoPedido);

                if (capacidadeRestante <= 0) {
                    const [primeiroDiaComEncaixe, ...outrosDiasComEncaixe] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(props.fabrica, dia, props.setor, props.pedido.item, restante, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosDoPedido);
                    props.dias.push(...outrosDiasComEncaixe);
                    dia = primeiroDiaComEncaixe;
                    capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(props.fabrica, dia, props.setor, props.pedido.item, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosDoPedido);
                }

                const quantidadeParaAlocar = Math.min(restante, capacidadeRestante);

                planejamentosDoPedido.push({
                    dia: dia,
                    item: props.itemContext,
                    pedido: props.pedido,
                    qtd: quantidadeParaAlocar,
                    setor: props.setor
                });

                restante -= quantidadeParaAlocar;

                if (restante > 0 && i === props.dias.length - 1) {
                    const [novaData] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                        props.fabrica,
                        this.calendario.subDays(dia, 1),
                        props.setor,
                        props.pedido.item,
                        restante,
                        new VerificaCapabilidade(props.pedido.item, props.setor),
                        planejamentosDoPedido
                    );
                    props.dias.push(novaData);
                }
                i++;
            }
            console.log('terminei alocacao')
            return planejamentosDoPedido;
        } catch (error) {
            console.error(error);
            throw new Error(`Erro ao alocar carga do pedido ${props.pedido.codigo}`);
        }
    }
}  