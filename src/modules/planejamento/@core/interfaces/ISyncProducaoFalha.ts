import { TabelaProducao } from "src/modules/planejamento/@core/entities/TabelaProducao.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Setor } from "src/modules/setor/@core/entities/Setor.entity";

export interface ISyncProducaoFalha {
    syncProducaFalha(setor: Setor, date: Date): TabelaProducao[] | Promise<TabelaProducao[]>;
}