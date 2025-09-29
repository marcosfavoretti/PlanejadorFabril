import { MetodoDeReAlocacao } from "@libs/lib/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISetorChain } from "../interfaces/ISetorChain";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { ResultadoAlocacao } from "../classes/ResultadoAlocacao";
import { Logger } from "@nestjs/common";
import { RealocacaoParcial } from "../classes/RealocacaoParcial";
import { AlocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/AlocacaoProps";
import { PipeSemSetorException } from "@libs/lib/modules/fabrica/@core/exception/PipeSemOSetor.exception";
import { RealocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/RealocaacoProps";



/**
 * @description{classe onde encapsula regras de nogocio de cada setor}
 */
export abstract class SetorService implements ISetorChain {

    private nextSetor?: SetorService;
    private logger = new Logger();

    constructor(
        private setor: CODIGOSETOR,
        private metodoAlocacao: MetodoDeAlocacao,
        private metodoRealocacao: MetodoDeReAlocacao,
    ) { }

    /**
     * @param date 
     * @returns 
     * @description percorre o chain de setores realocando os planejamentos falhos de cada setor. Sempre olhando o setor da frente para nao alocar mais cargo do que o possível
     */
    async realocar(
        props: RealocacaoProps,
        realocacaoAcumulada: RealocacaoParcial = new RealocacaoParcial(),
    ): Promise<RealocacaoParcial> {
        this.logger.log(`COMEÇO DA REALOCAÇAO ${this.setor}`);

        const doSetorAtual = await this.metodoRealocacao.hookRealocacao(
            {
                fabrica: props.fabrica,
                setor: this.setor,
                estrutura: props.estrutura,
                novoDia: props.novoDia,
                pedido: props.pedido,
                planDoPedido: props.planDoPedido,
                planFalho: props.planFalho,
                planejamentoFabril: props.planejamentoFabril,
                realocacaoUltSetor: props.realocacaoUltSetor
            }
        );

        realocacaoAcumulada.adicionado.push(...doSetorAtual.adicionado)
        realocacaoAcumulada.retirado.push(...doSetorAtual.retirado);

        // se houver próximo, empurra o estado adiante e pega o que ele acrescentar
        if (this.nextSetor) {
            props.realocacaoUltSetor = doSetorAtual;
            await this.nextSetor.realocar(props, realocacaoAcumulada);
        }
        return realocacaoAcumulada;
    }

    /**
     * @param pedido 
     * @returns 
     * @description percorre até o ultimo setor e depois retrocede o planejando com base no planejado do proximo setor. Retorno sera o planejamento acumulado do pedido junto com o planejamento do primeiro setor
     */
    public async alocar(props: AlocacaoProps): Promise<ResultadoAlocacao> {
        let planejamentoDoProximoSetor: PlanejamentoTemporario[] = [];
        let acumulado: PlanejamentoTemporario[] = [];

        if (this.nextSetor) {
            const resultadoDoProximo = await this.nextSetor.alocar(props);
            planejamentoDoProximoSetor = resultadoDoProximo.doSetorAtual;
            acumulado = [...resultadoDoProximo.acumulado];
        }

        const doSetorAtual = await this.metodoAlocacao.hookAlocacao(
            {
                ...props,
                setor: this.setor,
                planDoProximoSetor: planejamentoDoProximoSetor
            }
        );

        console.log(`SETOR ${this.setor} PROCESSADO`);

        return {
            doSetorAtual,
            acumulado: [...acumulado, ...doSetorAtual],
        };
    }


    public abstract cloneSetorService(): SetorService;

    //====================GETTERS/SETTERS====================

    public setMetodoDeAlocacao(metodo: MetodoDeAlocacao): void {
        this.metodoAlocacao = metodo;
    }

    public setMetodoDeReAlocacao(metodo: MetodoDeReAlocacao): void {
        this.metodoRealocacao = metodo;
    }

    public getMetodoDeAlocacao(): MetodoDeAlocacao {
        return this.metodoAlocacao;
    }

    public getSetorInChain(setor: CODIGOSETOR): SetorService {
        if (setor === this.setor) {
            return this;
        }
        if (!this.nextSetor) {
            throw new PipeSemSetorException(setor);
        }
        const targetSetor = this.nextSetor.getSetorInChain(setor);
        return targetSetor;
    }

    public getSetorInChainClone(setor: CODIGOSETOR): SetorService {
        if (setor === this.setor) {
            return this.cloneSetorService();
        }
        if (!this.nextSetor) {
            throw new Error('O setor não esta na corrente');
        }
        const targetSetor = this.nextSetor.getSetorInChain(setor);
        return targetSetor;
    }

    public getSetoresInChainClone(setores: CODIGOSETOR[]): SetorService[] {
        const resultado: SetorService[] = [];
        if (setores.includes(this.setor)) {
            resultado.push(this.cloneSetorService());
        }
        if (this.nextSetor) {
            return resultado.concat(this.nextSetor.getSetoresInChainClone(setores));
        }
        return resultado;
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

    getNextSetor(): SetorService | undefined {
        return this.nextSetor;
    }

    public getSetorCode(): CODIGOSETOR {
        return this.setor;
    }
}