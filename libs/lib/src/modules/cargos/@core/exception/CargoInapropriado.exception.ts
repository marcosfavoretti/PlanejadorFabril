export class CargoInapropriadoException extends Error {
    constructor(mensagem?: string) {
        super(mensagem || 'O cargo do usuário não é apropriado para executar essa ação.');
        this.name = 'CargoInapropriadoException';
    }
}