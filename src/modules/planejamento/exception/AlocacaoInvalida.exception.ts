export class AlocacaoInvalidaException extends Error {
    constructor(msg?: string) {
        super(`Alocação inválida de carga${msg ? ` detalhe: ${msg}` : ''}`);
    }
}