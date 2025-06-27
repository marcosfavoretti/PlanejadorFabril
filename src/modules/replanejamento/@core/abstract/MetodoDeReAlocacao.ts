import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { PlanejamentoDiario } from "../../../planejamento/@core/entities/PlanejamentoDiario.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { TabelaProducao } from "src/modules/producao-simulacao/@core/entities/TabelaProducao.entity";
import { IGerenciadorPlanejamentConsulta } from "src/modules/planejamento/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";

export abstract class MetodoDeReAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta
    ) { }

    protected abstract diasPossiveis(ponteiro: Date, producao: TabelaProducao): Promise<Date[]>;

    protected abstract realocacao(
        producaoFalha: TabelaProducao,
        setor: CODIGOSETOR,
        dias: Date[]
    ): Promise<PlanejamentoTemporario[]>;

    protected abstract realocacaoComDepedencia(
        producaoFalha: TabelaProducao,
        setor: CODIGOSETOR,
        dias: Date[],
        proxSetorPlan: PlanejamentoDiario[]
    ): Promise<PlanejamentoTemporario[]>;

    public async hookRealocacao(
        diaVirtual: Date,
        producaoFalha: TabelaProducao,
        setor: CODIGOSETOR,
        planDoProximoSetor?: PlanejamentoDiario[]
    ): Promise<PlanejamentoTemporario[]> {
        const planejamentos: PlanejamentoTemporario[] = [];
        if (planDoProximoSetor && planDoProximoSetor.length) { //caso tenha planejado do proximo setor e nao seja vazio
            const dias = this.diasPossiveis(diaVirtual, producaoFalha);
            // const realocacao = await this.realocacaoComDepedencia(producaoFalha, setor, )
        }
        try {
            const diasDoSetor = await this.diasPossiveis(
                producaoFalha.date_planej,
                producaoFalha
            );
            // return await this.realoacao(producaoFalha, setor, diasDoSetor, planDoProximoSetor);
        } catch (error) {
            throw new Error('nao foi possível alocar a carga');
        }
        return []
    }
}