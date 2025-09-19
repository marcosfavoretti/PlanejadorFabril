import { MetodoDeReAlocacao, RealocacaoComDepedenciaProps, RealocacaoSemDependenciaProps } from "../abstract/MetodoDeReAlocacao";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Logger } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import {
    addBusinessDays,
    differenceInBusinessDays,
    endOfDay,
    isAfter,
    isBefore,
    isEqual,
    isSameDay,
    subBusinessDays,
} from "date-fns";
import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial";
import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { VerificaCapabilidade } from "@libs/lib/modules/fabrica/@core/classes/VerificaCapabilidade";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";

export class RealocaPorCapabilidade extends MetodoDeReAlocacao {
    constructor(
        gerenciador: IGerenciadorPlanejamentConsulta,
        selecionarItem: ISelecionarItem
    ) {
        super(gerenciador, selecionarItem);
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

    protected async realocacao(
        props: RealocacaoSemDependenciaProps
    ): Promise<RealocacaoParcial> {
        this.logger.log(`REALOCACAO  SEM DEP INIT ${props.setor}`);

        const resultado: RealocacaoParcial = new RealocacaoParcial();

        const dataEstopim = props.planFalho.dia;

        //pega dos planejados oq é igual/depois da data de estopim e esta no setor corrente
        // const planejamentosImpactadoDoSetorASC = this.planejamentosDoSetor(
        //     props.planDoPedido,
        //     dataEstopim,
        //     props.setor,
        // );

        const planejamentosImpactadoDoSetorASC = [props.planFalho];

        /**
         * calculo do offset para manter a proporção dos dias
         */
        const offsetsRelativos = this.calcOffSet(
            planejamentosImpactadoDoSetorASC,
            dataEstopim,
        );

        for (const [index, planejamento] of planejamentosImpactadoDoSetorASC.entries()) {
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
                    new VerificaCapabilidade(props.pedido.item, props.setor),
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
                            new VerificaCapabilidade(props.pedido.item, props.setor),
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

    private quantoChegaDoUltimoSetorNaData(
        item: Item,
        ultSetor: CODIGOSETOR,
        planUltSetor: PlanejamentoTemporario[],
        compareDate: Date,
        decrementador = 0
    ): number {


        compareDate = subBusinessDays(compareDate, item.getLeadtime(ultSetor));
        console.log('data comparada', planUltSetor.map(d => d.dia), compareDate);

        const datasSelecionadas = planUltSetor
            .filter(add =>
                isBefore(add.dia, compareDate) || isEqual(add.dia, compareDate)
            )

        console.log('data selecionada', datasSelecionadas);

        const resultado = datasSelecionadas.reduce((total, a) => total + a.qtd, 0);

        Logger.log(resultado, 'QUANTO CHEGA');
        return (resultado - decrementador);
    }

    protected async realocacaoComDepedencia(
        props: RealocacaoComDepedenciaProps
    ): Promise<RealocacaoParcial> {
        this.logger.log(`REALOCACAO COM DEPENDENCIA INIT ${props.setor} ${props.planDoPedido.filter(a => a.setor === props.setor).reduce((a, b) => a += b.qtd, 0)}`);
        const realocacaoParcial = new RealocacaoParcial();
        const dataEstopim = props.planFalho.dia;

        /**
         * seleciona so os planejamentos do setor atual
         */
        const planejamentosDoSetorAtual = this.planejamentosDoSetor(
            props.planDoPedido,
            dataEstopim,
            props.setor,
        )
            .sort(
                (a, b) => a.dia.getTime() - b.dia.getTime()
            );

        /**
         * seleciona os planejamentos que vao ser impactados pela realocacao do item
         */
        const planejamentoImpactados: PlanejamentoTemporario[] = [];
        const ultimoSetor = props.realocacaoUltSetor.adicionado[0].setor;
        let decrementador: number = 0;
        const planejamentoDoUltimoSetor = props.planDoPedido.filter(plan => plan.setor === ultimoSetor && !props.realocacaoUltSetor.retirado.some(r => r.dia.getTime() === plan.dia.getTime()));
        console.log('fiz certo?', planejamentoDoUltimoSetor.reduce((a, b) => a += b.qtd, 0));

        for (const planejamento of planejamentosDoSetorAtual) {
            const quantoChega = this.quantoChegaDoUltimoSetorNaData(
                props.pedido.item,
                ultimoSetor,
                planejamentoDoUltimoSetor,
                planejamento.dia,
                decrementador
            )

            console.log(`quanto chegou no dia ${planejamento.dia} ${quantoChega}`);

            if (quantoChega < planejamento.qtd) {
                planejamentoImpactados.push(planejamento);
                realocacaoParcial.retirado.push(planejamento);
                continue; //se ele vai ser replanejado nao vou consumir do decrementador
            }

            decrementador += planejamento.qtd;
        }

        console.log('impactados', planejamentoImpactados.map(a => a.dia));
        
        const offsetMatrix = this.calcOffSet(planejamentoImpactados, props.planFalho.dia);

        for (const [index, planejamento] of planejamentoImpactados.entries()) {
            let totalParaRealocar = planejamento.qtd;

            if (totalParaRealocar <= 0) {
                console.log(
                    `✅ Setor ${props.setor} finalizado. Pulando para o próximo da chain...`,
                );
                break; // passa para o próximo setor na chain
            }

            const offset = offsetMatrix[index];

            let novaData = addBusinessDays(props.novoDia, offset);

            const datasParaAlocar = await this.gerenciadorPlan
                .diaParaAdiarProducaoEncaixe(
                    props.fabrica,
                    novaData,
                    props.setor,
                    planejamento.item,
                    totalParaRealocar,
                    new VerificaCapabilidade(props.pedido.item, props.setor),
                    realocacaoParcial.adicionado,
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
                            new VerificaCapabilidade(props.pedido.item, props.setor),
                            realocacaoParcial.adicionado,
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
                realocacaoParcial.adicionado.push(planejamentoNovo);
                totalParaRealocar -= qtd;
            }
        }

        return realocacaoParcial;

    }


    // protected async realocacaoComDepedencia(
    //     props: RealocacaoComDepedenciaProps
    // ): Promise<RealocacaoParcial> {
    //     this.logger.log(`REALOCACAO COM DEPENDENCIA INIT ${props.setor}`);

    //     const realocacaoParcial = new RealocacaoParcial();

    //     const dataEstopim = props.planFalho.dia;

    //     const planejamentosImpactadoDoSetorASC = this.planejamentosDoSetor(
    //         props.planDoPedido,
    //         dataEstopim,
    //         props.setor,
    //     );

    //     const ultimoSetor = props.realocacaoUltSetor.adicionado[0].setor;

    //     // realocacaoParcial.retirado.push(...planejamentosImpactadoDoSetorASC);

    //     const leadtimeUltimoSetor = props.pedido.getItem().getLeadtime(ultimoSetor);

    //     const ultSetorPlanejamentos = props.realocacaoUltSetor.adicionado.sort(
    //         this.sortStrategy(),
    //     );

    //     let restante = props.pedido.getLote();

    //     for (const planejamento of ultSetorPlanejamentos) {
    //         if (restante <= 0) break;

    //         const precisoAlocar = planejamento.qtd;
    //         //planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

    //         let dataLimite = leadtimeUltimoSetor > 0
    //             ? addBusinessDays(planejamento.dia, leadtimeUltimoSetor)
    //             : planejamento.dia;

    //         const datas = await this.gerenciadorPlan
    //             .diaParaAdiarProducaoEncaixe(
    //                 props.fabrica,
    //                 dataLimite,
    //                 props.setor,
    //                 props.pedido.item,
    //                 precisoAlocar,
    //                 new VerificaCapabilidade(props.pedido.item, props.setor),
    //                 realocacaoParcial.adicionado,
    //             );

    //         const qtdMatrix = await Promise.all(
    //             datas.map(dt => this.gerenciadorPlan.possoAlocarQuantoNoDia(
    //                 props.fabrica,
    //                 dt,
    //                 props.setor,
    //                 props.pedido.item,
    //                 new VerificaCapabilidade(props.pedido.item, props.setor),
    //                 realocacaoParcial.adicionado,
    //             ))
    //         );

    //         for (const [index, data] of datas.entries()) {
    //             const qtdChegaParaDia = this.quantoChegaDoUltimoSetorNaData(
    //                 props.pedido.item,
    //                 props.setor,
    //                 props.realocacaoUltSetor,
    //                 data);

    //             console.log(qtdChegaParaDia);

    //             const possoAlocarNesseDia = qtdMatrix[index] ?? 0;

    //             const qtdParaAlocar = Math.min(
    //                 precisoAlocar,
    //                 possoAlocarNesseDia,
    //                 props.pedido.item.capabilidade(props.setor),
    //             );

    //             /*  
    //                 console.log(
    //                  precisoAlocar,
    //                  possoAlocarNesseDia,
    //                  props.pedido.item.capabilidade(props.setor),
    //                  console.log('a', qtdParaAlocar)
    //              )*/

    //             if (qtdParaAlocar <= 0) continue;

    //             const plansImpactados = planejamentosImpactadoDoSetorASC
    //                 .filter(d => data.getTime() === d.dia.getTime());

    //             realocacaoParcial.retirado.push(...plansImpactados);

    //             realocacaoParcial.adicionado.push({
    //                 dia: data,
    //                 item: props.itemContext,
    //                 pedido: props.pedido,
    //                 qtd: qtdParaAlocar,
    //                 setor: props.setor,
    //             });

    //             restante -= qtdParaAlocar;
    //             if (restante <= 0) break; // encerramento antecipado
    //             if (index + 1 === datas.length && qtdParaAlocar > 0) {
    //                 const novasDatas = await this.gerenciadorPlan
    //                     .diaParaAdiarProducaoEncaixe(
    //                         props.fabrica,
    //                         data,
    //                         props.setor,
    //                         props.itemContext,
    //                         precisoAlocar,
    //                         new VerificaCapabilidade(props.pedido.item, props.setor),
    //                         realocacaoParcial.adicionado,
    //                     );
    //                 datas.push(...novasDatas);
    //             }
    //         }
    //     }
    //     return realocacaoParcial;
    // }
}
