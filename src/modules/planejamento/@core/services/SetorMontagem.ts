import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISyncProducao } from "../interfaces/ISyncProducao";
import { ISyncProducaoFalha } from "../interfaces/ISyncProducaoFalha";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";
import { IGerenciadorPlanejamentoMutation } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamento";
import { ISelecionarItem } from "src/modules/fabrica/@core/interfaces/ISelecionarItem";


export class SetorMontagem extends SetorService {
    constructor(
        @Inject(MetodoDeAlocacao) private _metododeAlocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) private _metodoDeReAlocacao: MetodoDeReAlocacao,
    ) {
        super(
            CODIGOSETOR.MONTAGEM,
            _metododeAlocacao,
            _metodoDeReAlocacao,
        );
    }
    public cloneSetorService(): SetorService {
        return new SetorMontagem(
            this._metododeAlocacao,
            this._metodoDeReAlocacao,
        );
    }
}