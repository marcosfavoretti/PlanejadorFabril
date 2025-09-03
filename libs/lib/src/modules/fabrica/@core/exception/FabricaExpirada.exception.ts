import { Fabrica } from "../entities/Fabrica.entity";

export class FabricaExpirada extends Error {
    constructor(fabrica: Fabrica) {
        super(`fabrica ${fabrica.fabricaId} esta expirada e nao pode fazer a ação`)
    }
}