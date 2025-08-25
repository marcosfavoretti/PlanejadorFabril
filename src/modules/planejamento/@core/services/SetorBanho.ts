import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "src/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";


export class SetorBanho extends SetorService {

    constructor(
        @Inject(MetodoDeAlocacao) private _metododeAlocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) private _metodoDeReAlocacao: MetodoDeReAlocacao,
    ) {
        super(
            CODIGOSETOR.BANHO,
            _metododeAlocacao,
            _metodoDeReAlocacao,
        );
    }

    public cloneSetorService(): SetorService {
        return new SetorBanho(
            this._metododeAlocacao,
            this._metodoDeReAlocacao,
        );
    }

}