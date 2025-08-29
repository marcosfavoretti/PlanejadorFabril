import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "@libs/lib/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";



export class SetorLixa extends SetorService {
    constructor(
        @Inject(MetodoDeAlocacao) private _metododealocacao: MetodoDeAlocacao,
        @Inject(MetodoDeReAlocacao) private _metodoDeReAlocacao: MetodoDeReAlocacao,
    ) {
        const setor = CODIGOSETOR.LIXA;
        super(
            setor,
            _metododealocacao,
            _metodoDeReAlocacao,
        );
    }

    public cloneSetorService(): SetorService {
        return new SetorLixa(
            this._metododealocacao,
            this._metodoDeReAlocacao,
        );
    }
}