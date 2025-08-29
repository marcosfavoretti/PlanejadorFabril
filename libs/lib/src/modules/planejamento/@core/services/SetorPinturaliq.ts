import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "@libs/lib/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";


export class SetorPinturaLiq extends SetorService {
    constructor(
        @Inject(MetodoDeAlocacao) private _metododeAlocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) private _metodoDeReAlocacao: MetodoDeReAlocacao,

    ) {
        const setor = CODIGOSETOR.PINTURALIQ;
        super(
            setor,
            _metododeAlocacao,
            _metodoDeReAlocacao,
        );
    }
    public cloneSetorService(): SetorService {
        return new SetorPinturaLiq(
            this._metododeAlocacao,
            this._metodoDeReAlocacao,
        );
    }
}