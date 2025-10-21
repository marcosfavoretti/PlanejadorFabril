import { ForbiddenException } from "@nestjs/common";

export class CargoInapropriadoException extends ForbiddenException {
    constructor(mensagem?: string) {
        super(mensagem || 'O cargo do usuário não é apropriado para executar essa ação.');
        this.name = 'CargoInapropriadoException';
    }
}