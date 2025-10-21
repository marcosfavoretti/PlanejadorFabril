export enum TipoMudancas {
    ATUALIZACAO = 'ATUALIZACAO',
    REMOCAO = 'REMOÇÃO',
    INSERCAO = 'INSERÇÃO'
}

export class Mudancas {
    constructor(
        private mudanca: TipoMudancas,
        private entidade: string,
        private valorAntigo: string,
        private valorNovo: string
    ) { }

    /**
     * @returns O tipo de mudança ocorrida (ATUALIZACAO, REMOCAO, INSERCAO).
     */
    public getMudanca(): TipoMudancas {
        return this.mudanca;
    }

    /**
     * @returns O nome da entidade ou campo que sofreu a mudança.
     */
    public getEntidade(): string {
        return this.entidade;
    }

    /**
     * @returns O valor que a entidade tinha antes da mudança.
     */
    public getValorAntigo(): string {
        return this.valorAntigo;
    }

    /**
     * @returns O novo valor da entidade após a mudança.
     */
    public getValorNovo(): string {
        return this.valorNovo;
    }
}