import { SetorService } from "../abstract/SetorService";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export interface ISetorChain {
    getSetorInChain(setor: CODIGOSETOR): SetorService;
    setNextSetor(setor: SetorService): SetorService;
}