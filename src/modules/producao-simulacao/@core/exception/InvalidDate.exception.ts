import { BadRequestException } from "@nestjs/common";

export class InvalidDateException extends BadRequestException{
    constructor(){
        super('Data mensionada inválida');
    }
}