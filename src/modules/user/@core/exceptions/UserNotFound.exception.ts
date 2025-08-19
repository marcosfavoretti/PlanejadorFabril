import { NotFoundException } from "@nestjs/common";

export class UserNotFoundException extends NotFoundException{
    constructor(){
        super('Não foi encontrado o usuario');
    }
}