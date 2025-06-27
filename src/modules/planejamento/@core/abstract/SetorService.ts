import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { Mercado } from "../classes/Mercado";
import { Pedido } from "../entities/Pedido.entity";
import { Planejamento } from "../entities/Planejamento.entity";
import { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";
import { ISetorExcecao } from "../interfaces/ISetorExcecao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { ISetorChain } from "../interfaces/ISetorChain";
import { IGerenciadorPlanejamentoMutation } from "../interfaces/IGerenciadorPlanejamento";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { ResultadoAlocacao } from "../classes/ResultadoAlocacao";

/**
 * @description{classe onde encapsula regras de nogocio de cada setor}
 */
export abstract class SetorService implements ISetorChain {
    private mercado: Mercado;
    private nextSetor?: SetorService;
    private divida: number | undefined;
    constructor(
        private readonly mercadoStrategy: ISyncProducao & ISyncProducaoFalha,
        private readonly gerenciadorPlan: IGerenciadorPlanejamentoMutation,
        private setor: CODIGOSETOR,
        private metodoAlocacao: MetodoDeAlocacao,
        private metodoRealocacao: MetodoDeReAlocacao,
        private excecao?: ISetorExcecao[],
    ) {
        this.mercado = new Mercado(this.setor);
    }


    setoresSnapShot(): Mercado[] {
        const mercados: Mercado[] = [this.mercado];
        if (this.nextSetor) {
            const nextSetor = this.nextSetor.setoresSnapShot()
            return mercados.concat(nextSetor);
        }
        return mercados;
    }

    /**
     * @param date 
     * @param producaoDoSetorAnteriorUltDia 
     * @returns 
     * @description pega as informacoes da producao pela estrategia instanciada, decrementa o conforme a producao do setor do ultimo dia e incremente com base na producao do setor anterior. Responsavel tambem por encadear todos os mercados dos proximos setores
     */
    async syncMercado(date: Date, producaoDoSetorAnteriorUltDia?: Mercado): Promise<Mercado[]> {
        try {
            const producaoAtual = await this.mercadoStrategy.syncProducao(this.setor, date);
            this.atualizarMercadoAtual(producaoAtual, producaoDoSetorAnteriorUltDia);
            const mercadosSincronizados = [this.mercado];
            if (this.nextSetor) {
                const mercadosFuturos = await this.nextSetor.syncMercado(date, producaoAtual);
                mercadosSincronizados.push(...mercadosFuturos);
            }
            return mercadosSincronizados;
        } catch (error) {
            console.error(error);
            throw new Error(`Erro ao sincronizar os mercados para o dia ${date.toLocaleDateString()}`);
        }
    }


    private atualizarMercadoAtual(producaoAtual: Mercado, producaoAnterior?: Mercado): void {
        if (producaoAnterior) this.mercado.concatMercado(producaoAnterior);
        this.mercado.subtrairMercados(producaoAtual);
    }

    /**
     * 
     * @param date 
     * @returns 
     * @description percorre o chain de setores realocando os planejamentos falhos de cada setor. Sempre olhando o setor da frente para nao alocar mais cargo do que o possível
     */
    async realocar(date: Date): Promise<PlanejamentoDiario[]> {
        const realocaoDoProximoSetor = this.nextSetor && await this.nextSetor.realocar(date);//vai para o último dia
        const falhas = await this.mercadoStrategy.syncProducaFalha(this.setor, date);
        if (!falhas && this.nextSetor) this.nextSetor.realocar(date);
        const planejamentoDiario: Array<PlanejamentoTemporario> = []
        for (const falha of falhas) {
            // planejamentoDiario.push(
            //     ...await this.metodoRealocacao
            //         .hookRealocacao(falha, this.setor, realocaoDoProximoSetor)
            // );
        }
        return await this.gerenciadorPlan.appendPlanejamento(planejamentoDiario);
        // for (const falha of falhas) {
        //     this.metodoRealocacao.hookRealocacao(falha)
        // }
        // const planDoSetor = planejamentoFalho.filter(plan => plan.getPlanejamentoOrigem().getSetor().getOperation() === this.setor.getOperation());
        // if (!planDoSetor.length && this.nextSetor) this.nextSetor.realocar(planejamentoFalho);
        // for (const plans of planDoSetor) {
        //     const novoPlanejamento = new Planejamento(plans.getPlanejamentoOrigem().getItem(), plans.getUnidadesParaFazer(), this.setor);
        //     try {
        //         const newDate = this.gerenciadorPlan.diaComFolgaNaProducao(
        //             plans.getDia(),
        //             novoPlanejamento
        //         );
        //         console.log('CONSEGUI REALOCAR', newDate);
        //     } catch (error) {
        //         // console.error(error);
        //         this.gerenciadorPlan.addDivida(novoPlanejamento)
        //     }
        // }
        // if (!this.nextSetor) return;
        // this.nextSetor.realocar(planejamentoFalho);
    }

    /**
     * @param pedido 
     * @returns 
     * @description percorre até o ultimo setor e depois retrocede o planejando com base no planejado do proximo setor
     */
    public async alocar(pedido: Pedido): Promise<ResultadoAlocacao> {
        let planejamentoDoProximoSetor: PlanejamentoTemporario[] = [];
        let acumulado: PlanejamentoTemporario[] = [];

        if (this.nextSetor) {
            const resultadoDoProximo = await this.nextSetor.alocar(pedido);
            planejamentoDoProximoSetor = resultadoDoProximo.doSetorAtual;
            acumulado = [...resultadoDoProximo.acumulado];
        }

        const doSetorAtual = await this.metodoAlocacao.hookAlocacao(
            pedido,
            this.setor,
            planejamentoDoProximoSetor
        );

        return {
            doSetorAtual,
            acumulado: [...acumulado, ...doSetorAtual]
        };
    }
    
    public setMetodoDeAlocacao(metodo: MetodoDeAlocacao): void {
        this.metodoAlocacao = metodo;
    }

    public setMetodoDeReAlocacao(metodo: MetodoDeReAlocacao): void {
        this.metodoRealocacao = metodo;
    }

    public getSetorInChain(setor: CODIGOSETOR): SetorService {
        if (setor === this.setor) {
            return this;
        }
        if (!this.nextSetor) {
            throw new Error('O setor não esta na corrente');
        }
        const targetSetor = this.nextSetor.getSetorInChain(setor);
        return targetSetor;
    }

    public setNextSetor(setor: SetorService): SetorService {
        this.nextSetor = setor;
        return setor;
    }
}