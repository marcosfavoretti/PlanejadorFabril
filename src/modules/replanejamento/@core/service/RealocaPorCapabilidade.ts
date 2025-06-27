import { MetodoDeReAlocacao } from "../abstract/MetodoDeReAlocacao";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { PlanejamentoDiario } from "src/modules/planejamento/@core/entities/PlanejamentoDiario.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { TabelaProducao } from "src/modules/producao-simulacao/@core/entities/TabelaProducao.entity";

export class RealocaPorCapabilidade extends MetodoDeReAlocacao {
    protected async  realocacaoComDepedencia(producaoFalha: TabelaProducao, setor: CODIGOSETOR, dias: Date[], proxSetorPlan: PlanejamentoDiario[]): Promise<PlanejamentoTemporario[]> {
        return [];
   }
    protected async realocacao(producaoFalha: TabelaProducao, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]> {
        return [];
    }
    protected async diasPossiveis(ponteiro: Date, producao: TabelaProducao): Promise<Date[]> {
        return [];
    }
}