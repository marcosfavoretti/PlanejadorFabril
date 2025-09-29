import { AlocacaoComDependenciaProps, AlocacaoSemDependenciaProps, MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentConsulta } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { VerificaCapabilidade } from "@libs/lib/modules/fabrica/@core/classes/VerificaCapabilidade";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";
import { subBusinessDays } from "date-fns";

export class AlocaPorCapabilidade extends MetodoDeAlocacao {

    constructor(
        gerenciador: IGerenciadorPlanejamentConsulta,
        selecionador: ISelecionarItem
    ) {
        super(gerenciador, selecionador);
    }

    private sortStrategy(): (a, b) => number {
        return (a, b) => b - a;
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaCapabilidade(pedido.item, codigoSetor);
    }

    protected async diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR, planejamentoFabril: PlanejamentoTemporario[]): Promise<Date[]> {
        try {
            const dias = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                pedido.getSafeDate(),
                setor,
                pedido.item,
                pedido.lote,
                new VerificaCapabilidade(pedido.item, setor),
                planejamentoFabril
            );
            return Array.from(dias.keys());
        } catch (error) {
            console.error(error);
            throw new Error(`Problema a consultar as datas para adiantar a producao\n${error}`)
        }
    }

    protected async alocacaoComDependencia(
        props: AlocacaoComDependenciaProps
    ): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = props.pedido.getItem().getLeadtime(props.setor);
        const planejamentosProxOrdenados = props.planDoProximoSetor.sort(this.sortStrategy());
        let restante = props.pedido.getLote();

        for (const planejamento of planejamentosProxOrdenados) {
            if (restante <= 0) break;

            const precisoAlocar = planejamento.qtd;

            // calcula data limite considerando leadtime
            const dataLimite =
                leadtime > 0
                    ? subBusinessDays(planejamento.dia, leadtime)
                    : planejamento.dia;

            // gera as primeiras datas possíveis
            let fila = Array.from(
                (
                    await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                        dataLimite,
                        props.setor,
                        props.itemContext,
                        props.pedido.lote,
                        new VerificaCapabilidade(props.pedido.item, props.setor),
                        props.planejamentoFabril,
                        planejamentosTemporarios
                    )
                ).entries()
            );

            // consome a fila até terminar o restante
            while (fila.length > 0 && restante > 0) {
                const [data, qtd] = fila.shift()!;

                const qtdParaAlocar = Math.min(
                    restante,
                    qtd || Infinity,
                    props.pedido.item.capabilidade(props.setor)
                );

                if (qtdParaAlocar > 0) {
                    planejamentosTemporarios.push({
                        dia: data,
                        item: props.itemContext,
                        pedido: props.pedido,
                        qtd: qtdParaAlocar,
                        setor: props.setor,
                    });
                    restante -= qtdParaAlocar;
                }

                // fila acabou mas ainda falta -> busca mais datas
                if (fila.length === 0 && restante > 0) {
                    const novasDatas = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                        data,
                        props.setor,
                        props.itemContext,
                        precisoAlocar, // usa qtd do próximo setor
                        new VerificaCapabilidade(props.pedido.item, props.setor),
                        props.planejamentoFabril,
                        planejamentosTemporarios
                    );
                    fila.push(...novasDatas.entries());
                }
            }
        }

        return planejamentosTemporarios;
    }

    protected async alocacao(props: AlocacaoSemDependenciaProps): Promise<PlanejamentoTemporario[]> {
        try {
            const planejamentosDoPedido: PlanejamentoTemporario[] = [];
            let restante = props.pedido.getLote();
            // let i = 0;
            props.dias.sort((a, b) => b.getTime() - a.getTime());
            const diasXqtd = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                props.pedido.getSafeDate(),
                props.setor,
                props.pedido.item,
                props.pedido.lote,
                new VerificaCapabilidade(props.pedido.item, props.setor),
                props.planejamentoFabril
            );
            for (const [dia, qtd] of diasXqtd) {
                const quantidadeParaAlocar = Math.min(restante, qtd);
                planejamentosDoPedido.push({
                    dia: dia,
                    item: props.itemContext,
                    pedido: props.pedido,
                    qtd: quantidadeParaAlocar,
                    setor: props.setor
                });
                restante -= quantidadeParaAlocar;
            }
            // while (restante > 0 && i < props.dias.length) {
            //     let dia = props.dias[i];

            //     let capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(
            //         dia,
            //         props.setor,
            //         props.itemContext,
            //         new VerificaCapabilidade(props.pedido.item, props.setor),
            //         props.planejamentoFabril,
            //         planejamentosDoPedido
            //     );

            //     if (capacidadeRestante <= 0) {
            //         const [primeiroDiaComEncaixe, ...outrosDiasComEncaixe] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
            //             dia,
            //             props.setor,
            //             props.itemContext,
            //             restante,
            //             new VerificaCapabilidade(props.pedido.item, props.setor),
            //             props.planejamentoFabril,
            //             planejamentosDoPedido
            //         );
            //         props.dias.push(...outrosDiasComEncaixe);
            //         dia = primeiroDiaComEncaixe;
            //         capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(props.fabrica, dia, props.setor, props.pedido.item, new VerificaCapabilidade(props.pedido.item, props.setor), planejamentosDoPedido);
            //     }

            //     const quantidadeParaAlocar = Math.min(restante, capacidadeRestante);

            //     planejamentosDoPedido.push({
            //         dia: dia,
            //         item: props.itemContext,
            //         pedido: props.pedido,
            //         qtd: quantidadeParaAlocar,
            //         setor: props.setor
            //     });

            //     restante -= quantidadeParaAlocar;

            //     if (restante > 0 && i === props.dias.length - 1) {
            //         const [novaData] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
            //             this.calendario.subDays(dia, 1),
            //             props.setor,
            //             props.pedido.item,
            //             restante,
            //             new VerificaCapabilidade(props.pedido.item, props.setor),
            //             props.planejamentoFabril,
            //             planejamentosDoPedido
            //         );
            //         props.dias.push(novaData);
            //     }
            //     i++;
            // }
            console.log('terminei alocacao')
            return planejamentosDoPedido;
        } catch (error) {
            console.error(error);
            throw new Error(`Erro ao alocar carga do pedido ${props.pedido.codigo}`);
        }
    }
}  