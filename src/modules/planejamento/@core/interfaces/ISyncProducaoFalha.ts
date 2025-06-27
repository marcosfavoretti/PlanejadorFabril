import { TabelaProducao } from "src/modules/producao-simulacao/@core/entities/TabelaProducao.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export interface ISyncProducaoFalha {
    syncProducaFalha(setor: CODIGOSETOR, date: Date): TabelaProducao[] | Promise<TabelaProducao[]>;
}