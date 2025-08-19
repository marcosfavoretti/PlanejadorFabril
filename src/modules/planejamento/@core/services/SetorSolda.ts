import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { IGerenciadorPlanejamentoMutation } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamento";

export class SetorSolda extends SetorService {
    constructor(
        @Inject(ISyncProducao) mercadoStrategy: ISyncProducao & ISyncProducaoFalha,
        @Inject(IGerenciadorPlanejamentoMutation) gerenciadorPlan: IGerenciadorPlanejamentoMutation,
        @Inject(MetodoDeAlocacao) metododealocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) metodoDeReAlocacao: MetodoDeReAlocacao
    ) {
        const setor = CODIGOSETOR.SOLDA;
        super(mercadoStrategy,
            gerenciadorPlan,
            setor,
            metododealocacao,
            metodoDeReAlocacao
        );
    }
    

}