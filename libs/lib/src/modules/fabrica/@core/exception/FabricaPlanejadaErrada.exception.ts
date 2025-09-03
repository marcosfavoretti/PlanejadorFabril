import { Fabrica } from "../entities/Fabrica.entity";

export class FabricaPlanejadaErradaException extends Error{
    constructor(
        fabrica: Fabrica
    ){
        super(`fabrica ${fabrica.fabricaId} tem planejamentos invalidos`)
    }
}