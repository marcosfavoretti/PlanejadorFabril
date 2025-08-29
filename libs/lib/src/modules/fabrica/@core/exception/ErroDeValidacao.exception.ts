export class ErroDeValidacao extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ErroDeValidacao';
    }
}