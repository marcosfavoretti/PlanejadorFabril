import { MetodoDeReAlocacao, RealocacaoComDepedenciaProps, RealocacaoSemDependenciaProps } from "../abstract/MetodoDeReAlocacao";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Logger } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import {
    addBusinessDays,
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


    protected async realocacao(
        props: RealocacaoSemDependenciaProps
    ): Promise<RealocacaoParcial> {

        Logger.log(`REALOCACAO SEM DEP INIT ${props.setor}`);

        const resultado: RealocacaoParcial = new RealocacaoParcial();

        const planejamentosImpactadoDoSetorASC = [props.planFalho];

        for (const planejamento of planejamentosImpactadoDoSetorASC) {
            let totalParaRealocar = planejamento.qtd;

            if (totalParaRealocar <= 0) {

                break; // passa para o próximo setor na chain
            }

            let novaData = props.novoDia;

            //mesmo que usuario queira eu nao deixo ele realocar em cima de capabilidade altas
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

        const datasSelecionadas = planUltSetor
            .filter(add =>
                isBefore(add.dia, compareDate) || isEqual(add.dia, compareDate)
            )

        console.log(`datas selecionadas ${datasSelecionadas.map(a => a.dia)} para data ${compareDate}`)

        const resultado = datasSelecionadas.reduce((total, a) => total + a.qtd, 0);

        console.log(resultado, 'QUANTO CHEGA');
        return (resultado - decrementador);
    }

    protected async realocacaoComDepedencia(
        props: RealocacaoComDepedenciaProps
    ): Promise<RealocacaoParcial> {
        console.log(`====================================================`);
        console.log(`INICIANDO REALOCAÇÃO PARA O SETOR: ${props.setor}`);
        console.log(`Recebido do setor anterior (${props.realocacaoUltSetor.adicionado[0]?.setor || 'N/A'}):`);
        console.log(`--> Datas ADICIONADAS pelo setor anterior: ${props.realocacaoUltSetor.adicionado.map(p => p.dia)}`);
        console.log(`--> Datas REMOVIDAS pelo setor anterior: ${props.realocacaoUltSetor.retirado.map(p => p.dia)}`);
        console.log(`====================================================`);

        const realocacaoParcial = new RealocacaoParcial();

        /**
         * seleciona so os planejamentos do setor atual
        */
        const ultimoSetor = props.realocacaoUltSetor.adicionado[0].setor;
        
        const planejamentosDoSetorAtual = 
            props.planDoPedido.filter(plan => plan.setor === props.setor).sort((a, b) => (a.dia.getTime() - b.dia.getTime()));

        /**
         * seleciona os planejamentos que vao ser impactados pela realocacao do item
         */
        const planejamentoImpactados: PlanejamentoTemporario[] = [];
        let decrementador: number = 0;

        //filtro os dias do setor anterior e pego somente os dias que nao tiveram producao
        const planejamentoDoUltimoSetor =
            props.planDoPedido.filter(
                plan => plan.setor === ultimoSetor &&
                    !props.realocacaoUltSetor.retirado.some(r => isSameDay(r.dia, plan.dia))
            )
            .concat(props.realocacaoUltSetor.adicionado)

        console.log(props.realocacaoUltSetor.retirado.map(a => a.dia));

        console.log(planejamentoDoUltimoSetor.map(a => a.dia));

        for (const planejamento of planejamentosDoSetorAtual) {
            const quantoChega = this.quantoChegaDoUltimoSetorNaData(
                props.pedido.item,
                ultimoSetor,
                planejamentoDoUltimoSetor,
                planejamento.dia,
                decrementador
            )
            console.log(`quanto chega ${props.setor} ${quantoChega}/${planejamento.qtd}`)

            if (quantoChega < planejamento.qtd) {
                planejamentoImpactados.push(planejamento);
                realocacaoParcial.retirado.push(planejamento);
                console.log(`item adicionado ao retirados ${planejamento.dia}`)
                continue; //se ele vai ser replanejado nao vou consumir do decrementador
            }

            decrementador += planejamento.qtd;
        }


        // const offsetMatrix = this.calcOffSet(planejamentoImpactados, props.planFalho.dia);

        //intero a lista com base na data de alocacao do ultimo setor     
        for (const [index, planejamento] of props.realocacaoUltSetor.adicionado.entries()) {
            let totalParaRealocar = planejamento.qtd;

            if (totalParaRealocar <= 0) {
                break; // passa para o próximo setor na chain
            }

            // const offset = offsetMatrix[index];
            //incrementa a data com base no leadtime do ultimo setor
            let novaData = addBusinessDays(planejamento.dia, props.pedido.item.getLeadtime(ultimoSetor));

            const planejamentoModificado: PlanejamentoTemporario = {
                ...planejamento,
                setor: props.setor
            }

            const datasParaAlocar = await this.gerenciadorPlan
                .diaParaAdiarProducaoEncaixe(
                    props.fabrica,
                    novaData,
                    props.setor,
                    planejamentoModificado.item,
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
                            planejamentoModificado.item,
                            new VerificaCapabilidade(props.pedido.item, props.setor),
                            realocacaoParcial.adicionado,
                        ),
                ),
            );

            for (const [idx, dataParaAlocar] of datasParaAlocar.entries()) {
                const qtd = Math.min(
                    qtdAlocacaoMatrix[idx],
                    totalParaRealocar,
                    planejamentoModificado.pedido.item.capabilidade(props.setor),
                );
                const planejamentoNovo: PlanejamentoTemporario = {
                    ...planejamentoModificado,
                    planejamentoSnapShotId: undefined,
                    item: props.itemContext,
                    dia: dataParaAlocar,
                    qtd: qtd,
                };
                realocacaoParcial.adicionado.push(planejamentoNovo);
                totalParaRealocar -= qtd;
            }
        }
        console.debug(`====================================================`);
        console.debug(`FINALIZANDO REALOCAÇÃO PARA O SETOR: ${props.setor}`);
        console.debug(`--> Itens que ESTE setor está REMOVENDO: ${realocacaoParcial.retirado.map(d => d.dia)}`);
        console.debug(`--> Itens que ESTE setor está ADICIONANDO: ${realocacaoParcial.adicionado.map(d => `${d.qtd} em ${d.dia}`)}`);
        console.debug(`====================================================`);
        return realocacaoParcial;
    }
}
