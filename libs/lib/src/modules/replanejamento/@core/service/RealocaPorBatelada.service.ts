import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial";
import { MetodoDeReAlocacao, RealocacaoComDepedenciaProps, RealocacaoSemDependenciaProps } from "../abstract/MetodoDeReAlocacao";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { VerificaBatelada } from "@libs/lib/modules/fabrica/@core/classes/VerificaBatelada";
import { addBusinessDays, differenceInBusinessDays, isAfter, isSameDay } from "date-fns";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { Logger } from "@nestjs/common";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";

export class RealocaPorBateladaService
    extends MetodoDeReAlocacao {

    constructor(
        private readonly numMaxBatelada: number,
        gerenciador: IGerenciadorPlanejamentConsulta,
        public selecionador: ISelecionarItem
    ) {
        console.log(`Batelada setada para ${numMaxBatelada}!`)
        if (!numMaxBatelada) throw new Error('um valor limite tem que ser informado');
        super(gerenciador, selecionador);
    }
    logger = new Logger();
    protected calendario: Calendario;

    /**
        * @param planejamentosDoPedido
        * @param dataEstopim
        * @param setor
        * @description filtra os planejamentos do setor em questao em que a data de estopim é maior ou igual
        * @returns
        */
    private planejamentosDoSetor(
        planejamentosDoPedido: PlanejamentoTemporario[],
        dataEstopim: Date,
        setor: CODIGOSETOR,
    ): PlanejamentoTemporario[] {
        return planejamentosDoPedido
            .filter((p) =>
                p.setor === setor &&
                (isAfter(p.dia, dataEstopim) || isSameDay(p.dia, dataEstopim))
            )
            .sort((a, b) => a.dia.getTime() - b.dia.getTime());
    }

    /**
      * @param planejamentos
      * @param dataEstopim
      * @description calcula a diferenca de dias entre o planejamento estopim e o planejamentos afetados
      * @returns
      */
    private calcOffSet(
        planejamentos: PlanejamentoTemporario[],
        dataEstopim: Date,
    ): number[] {
        return planejamentos.map((plan) =>
            differenceInBusinessDays(plan.dia, dataEstopim)
        );
    }

    protected async realocacao(props: RealocacaoSemDependenciaProps): Promise<RealocacaoParcial> {
        this.logger.log(`REALOCACAO COM DEPENDENCIA SEM DEP INIT ${props.setor}`);

        const resultado: RealocacaoParcial = new RealocacaoParcial();

        const dataEstopim = props.planFalho.dia;

        //pega dos planejados oq é depois da data de estopim e esta no setor corrente
        const planejamentosImpactadoDoSetorASC = this.planejamentosDoSetor(
            props.planDoPedido,
            dataEstopim,
            props.setor,
        );

        // setor === props.planejamentoFalho.setor && planejamentosImpactadoDoSetorASC.unshift(props.planejamentoFalho);
        const offsetsRelativos = this.calcOffSet(
            planejamentosImpactadoDoSetorASC,
            dataEstopim,
        );

        // let totalParaRealocar = props.planejamentoFalho.qtd;

        for (
            const [index, planejamento] of planejamentosImpactadoDoSetorASC
                .entries()
        ) {
            let totalParaRealocar = planejamento.qtd;

            if (totalParaRealocar <= 0) {
                console.log(
                    `✅ Setor ${props.setor} finalizado. Pulando para o próximo da chain...`,
                );
                break; // passa para o próximo setor na chain
            }

            const offset = offsetsRelativos[index];

            let novaData = addBusinessDays(props.novoDia, offset);

            const datasParaAlocar = await this.gerenciadorPlan
                .diaParaAdiarProducaoEncaixe(
                    props.fabrica,
                    novaData,
                    props.setor,
                    planejamento.item,
                    totalParaRealocar,
                    new VerificaBatelada(this.numMaxBatelada),
                    resultado.adicionado,
                );

            // if (data <= 0) {
            //     novaData = this.calendario.proximoDiaUtilReplanejamento(novaData);
            //     qtdAlocada = Math.min(totalParaRealocar, capacidade);
            // }

            const qtdAlocacaoMatrix = await Promise.all(
                datasParaAlocar.map(
                    (data) =>
                        this.gerenciadorPlan.possoAlocarQuantoNoDia(
                            props.fabrica,
                            data,
                            props.setor,
                            planejamento.item,
                            new VerificaBatelada(this.numMaxBatelada),
                            resultado.adicionado,
                        ),
                ),
            );

            for (const [idx, dataParaAlocar] of datasParaAlocar.entries()) {
                const qtd = Math.min(
                    qtdAlocacaoMatrix[idx],
                    totalParaRealocar,
                    planejamento.pedido.item.capabilidade(props.setor),
                );
                const planejamentoNovo: PlanejamentoTemporario = {
                    ...planejamento,
                    planejamentoSnapShotId: undefined,
                    item: props.itemContext,
                    dia: dataParaAlocar,
                    qtd: qtd,
                };
                resultado.retirado.push(planejamento);
                resultado.adicionado.push(planejamentoNovo);
                totalParaRealocar -= qtd;
            }
        }

        return resultado;
    }

    protected async realocacaoComDepedencia(props: RealocacaoComDepedenciaProps): Promise<RealocacaoParcial> {
        this.logger.log(`REALOCACAO COM DEPENDENCIA INIT ${props.setor}`);
        const realocacaoParcial = new RealocacaoParcial();

        const dataEstopim = props.planFalho.dia;

        const planejamentosImpactadoDoSetorASC = this.planejamentosDoSetor(
            props.planDoPedido,
            dataEstopim,
            props.setor,
        );

        const ultimoSetor = props.realocacaoUltSetor.adicionado[0].setor;

        realocacaoParcial.retirado.push(...planejamentosImpactadoDoSetorASC);

        const leadtime = props.pedido.getItem().getLeadtime(ultimoSetor);

        const ultSetorPlanejamentos = props.realocacaoUltSetor.adicionado.sort(
            (a, b) => b.dia.getTime() - a.dia.getTime()
        );

        let restante = props.pedido.getLote();

        for (const planejamento of ultSetorPlanejamentos) {
            if (restante <= 0) break;

            const precisoAlocar = planejamento.qtd;
            //planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            let dataLimite = leadtime > 0
                ? addBusinessDays(planejamento.dia, leadtime)
                : planejamento.dia;

            const datas = await this.gerenciadorPlan
                .diaParaAdiarProducaoEncaixe(
                    props.fabrica,
                    dataLimite,
                    props.setor,
                    props.pedido.item,
                    precisoAlocar,
                    new VerificaBatelada(this.numMaxBatelada),
                    realocacaoParcial.adicionado,
                );

            const qtdMatrix = await Promise.all(
                datas.map(dt => this.gerenciadorPlan.possoAlocarQuantoNoDia(
                    props.fabrica,
                    dt,
                    props.setor,
                    props.pedido.item,
                    new VerificaBatelada(this.numMaxBatelada),
                    realocacaoParcial.adicionado,
                ))
            );

            for (const [index, data] of datas.entries()) {
                console.log(qtdMatrix);
                const possoAlocarNesseDia = qtdMatrix[index] ?? 0;
                const qtdParaAlocar = Math.min(
                    precisoAlocar,
                    possoAlocarNesseDia,
                    props.pedido.item.capabilidade(props.setor),
                );
                console.log(
                    precisoAlocar,
                    possoAlocarNesseDia,
                    props.pedido.item.capabilidade(props.setor),
                )

                console.log('a', qtdParaAlocar)
                if (qtdParaAlocar <= 0) continue;
                realocacaoParcial.adicionado.push({
                    dia: data,
                    item: props.itemContext,
                    pedido: props.pedido,
                    qtd: qtdParaAlocar,
                    setor: props.setor,
                });
                restante -= qtdParaAlocar;
                if (restante <= 0) break; // encerramento antecipado
                if (index + 1 === datas.length && qtdParaAlocar > 0) {
                    const novasDatas = await this.gerenciadorPlan
                        .diaParaAdiarProducaoEncaixe(
                            props.fabrica,
                            data,
                            props.setor,
                            props.itemContext,
                            precisoAlocar,
                            new VerificaBatelada(this.numMaxBatelada),
                            realocacaoParcial.adicionado,
                        );;
                    datas.push(...novasDatas);
                }
            }
        }
        return realocacaoParcial;
    }
}