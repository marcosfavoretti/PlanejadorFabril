import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "@libs/lib/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { IGerenciadorPlanejamentoMutation } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamento";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";

export class SetorSolda extends SetorService {
    constructor(
        @Inject(MetodoDeAlocacao) private _metododeAlocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) private _metodoDeReAlocacao: MetodoDeReAlocacao,

    ) {
        super(
            CODIGOSETOR.SOLDA,
            _metododeAlocacao,
            _metodoDeReAlocacao,
        );
    }

    public cloneSetorService(): SetorService {
        return new SetorSolda(
            this._metododeAlocacao,
            this._metodoDeReAlocacao,
        );
    }
}
