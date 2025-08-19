import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { ISetorExcecao } from "../interfaces/ISetorExcecao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { ISetorChain } from "../interfaces/ISetorChain";
import { IGerenciadorPlanejamentoMutation } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamento";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { ResultadoAlocacao } from "../classes/ResultadoAlocacao";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { RealocacaoProps } from "src/modules/fabrica/@core/classes/RealocacaoProps";
import { Logger } from "@nestjs/common";
import { RealocacaoParcial } from "../classes/RealocacaoParcial";

/**
 * @description{classe onde encapsula regras de nogocio de cada setor}
 */
export abstract class SetorService implements ISetorChain {

    private nextSetor?: SetorService;
    private divida: number | undefined;
    private logger = new Logger();

    constructor(
        private readonly mercadoStrategy: ISyncProducao & ISyncProducaoFalha,
        private readonly gerenciadorPlan: IGerenciadorPlanejamentoMutation,
        private setor: CODIGOSETOR,
        private metodoAlocacao: MetodoDeAlocacao,
        private metodoRealocacao: MetodoDeReAlocacao,
        private excecao?: ISetorExcecao[],
    ) { }

    /**
    //  * @param date 
    //  * @param producaoDoSetorAnteriorUltDia 
    //  * @returns 
    //  * @description pega as informacoes da producao pela estrategia instanciada, decrementa o conforme a producao do setor do ultimo dia e incremente com base na producao do setor anterior. Responsavel tambem por encadear todos os mercados dos proximos setores
    //  */
    // async syncMercado(date: Date, producaoDoSetorAnteriorUltDia?: Mercado): Promise<Mercado[]> {
    //     try {
    //         const producaoAtual = await this.mercadoStrategy.syncProducao(this.setor, date);
    //         this.atualizarMercadoAtual(producaoAtual, producaoDoSetorAnteriorUltDia);
    //         const mercadosSincronizados = [this.mercado];
    //         if (this.nextSetor) {
    //             const mercadosFuturos = await this.nextSetor.syncMercado(date, producaoAtual);
    //             mercadosSincronizados.push(...mercadosFuturos);
    //         }
    //         return mercadosSincronizados;
    //     } catch (error) {
    //         console.error(error);
    //         throw new Error(`Erro ao sincronizar os mercados para o dia ${date.toLocaleDateString()}`);
    //     }
    // }

    // private atualizarMercadoAtual(producaoAtual: Mercado, producaoAnterior?: Mercado): void {
    //     if (producaoAnterior) this.mercado.concatMercado(producaoAnterior);
    //     this.mercado.subtrairMercados(producaoAtual);
    // }

    /**
     * @param date 
     * @returns 
     * @description percorre o chain de setores realocando os planejamentos falhos de cada setor. Sempre olhando o setor da frente para nao alocar mais cargo do que o possível
     */
    async realocar(
        fabrica: Fabrica,
        props: RealocacaoProps,
        realocacaoAcumulada: RealocacaoParcial = new RealocacaoParcial(),
        realocacaoUltimoSetor?: RealocacaoParcial,
    ): Promise<RealocacaoParcial> {
        this.logger.log(`COMEÇO DA REALOCAÇAO ${this.setor}`);

        const doSetorAtual = await this.metodoRealocacao.hookRealocacao(
            fabrica,
            this.setor,
            props,
            this.metodoAlocacao.verificacaoCapacidade(props.pedido, this.setor), //mal cheiro pq vejo o metodo de alocacao para fazer a realocacao
            realocacaoUltimoSetor
        );

        realocacaoAcumulada.adicionado.push(...doSetorAtual.adicionado)
        realocacaoAcumulada.retirado.push(...doSetorAtual.retirado);
        
        // se houver próximo, empurra o estado adiante e pega o que ele acrescentar
        if (this.nextSetor) {
            // você pode ajustar props aqui se precisar propagar alguma mudança causada no setor atual
            await this.nextSetor.realocar(
                fabrica, {
                ...props,
            },
                realocacaoAcumulada,
                doSetorAtual
            );
        }
        return realocacaoAcumulada;
    }

    /**
     * @param pedido 
     * @returns 
     * @description percorre até o ultimo setor e depois retrocede o planejando com base no planejado do proximo setor. Retorno sera o planejamento acumulado do pedido junto com o planejamento do primeiro setor
     */
    public async alocar(fabrica: Fabrica, pedido: Pedido): Promise<ResultadoAlocacao> {
        let planejamentoDoProximoSetor: PlanejamentoTemporario[] = [];
        let acumulado: PlanejamentoTemporario[] = [];

        if (this.nextSetor) {
            const resultadoDoProximo = await this.nextSetor.alocar(fabrica, pedido);
            planejamentoDoProximoSetor = resultadoDoProximo.doSetorAtual;
            acumulado = [...resultadoDoProximo.acumulado];
        }

        const doSetorAtual = await this.metodoAlocacao.hookAlocacao(
            fabrica,
            pedido,
            this.setor,
            planejamentoDoProximoSetor
        );

        console.log(`SETOR ${this.setor} PROCESSADO`);

        return {
            doSetorAtual,
            acumulado: [...acumulado, ...doSetorAtual],
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

    public getSetoresInChain(setores: CODIGOSETOR[]): SetorService[] {
        const resultado: SetorService[] = [];

        if (setores.includes(this.setor)) {
            resultado.push(this);
        }

        if (this.nextSetor) {
            return resultado.concat(this.nextSetor.getSetoresInChain(setores));
        }

        return resultado;
    }

    public setNextSetor(setor: SetorService): SetorService {
        this.nextSetor = setor;
        return setor;
    }

    public getSetorCode(): CODIGOSETOR {
        return this.setor;
    }


}