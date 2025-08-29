import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";
import { Mercado } from "../classes/Mercado";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export interface ISyncProducao {
    syncProducao(setor: Setor, date: Date): Mercado | Promise<Mercado>;
}

export const ISyncProducao = Symbol('ISyncProducao');