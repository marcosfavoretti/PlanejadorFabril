import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";

export class PipeSemSetorException extends Error{
    constructor(codigo: CODIGOSETOR){
        super(
            `O pipe de setores dessa fabrica nao tem o setor da operação ${codigo}`
        );
    }
}