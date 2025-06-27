import { Mercado } from "../classes/Mercado";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export interface ISyncProducao {
    syncProducao(setor: CODIGOSETOR, date: Date): Mercado | Promise<Mercado>;
}

export const ISyncProducao = Symbol('ISyncProducao');