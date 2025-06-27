import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentoMutation } from "../interfaces/IGerenciadorPlanejamento";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";


export class SetorBanho extends SetorService {
    constructor(
        @Inject(ISyncProducao) mercadoStrategy: ISyncProducao & ISyncProducaoFalha,
        @Inject(IGerenciadorPlanejamentoMutation) gerenciadorPlan: IGerenciadorPlanejamentoMutation,
        @Inject(MetodoDeAlocacao) metododealocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) metodoDeReAlocacao: MetodoDeReAlocacao

    ) {
        const setor = CODIGOSETOR.BANHO;
        super(mercadoStrategy,
            gerenciadorPlan,
            setor,
            metododealocacao,
            metodoDeReAlocacao
        );
    }
}