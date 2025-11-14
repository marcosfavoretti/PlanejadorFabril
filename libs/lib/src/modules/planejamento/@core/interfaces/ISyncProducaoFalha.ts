import { TabelaProducao } from '@libs/lib/modules/planejamento/@core/entities/TabelaProducao.entity';
import { CODIGOSETOR } from '../enum/CodigoSetor.enum';
import { Setor } from '@libs/lib/modules/setor/@core/entities/Setor.entity';

export interface ISyncProducaoFalha {
  syncProducaFalha(
    setor: Setor,
    date: Date,
  ): TabelaProducao[] | Promise<TabelaProducao[]>;
}
