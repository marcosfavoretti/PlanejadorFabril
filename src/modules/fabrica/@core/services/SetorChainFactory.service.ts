import { Inject } from "@nestjs/common";
import { SetorService } from "src/modules/planejamento/@core/abstract/SetorService";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export class SetorChainFactoryService {
    @Inject('PIPE_FABRICACAO') private pipeProducao: SetorService


    getSetor(setor: CODIGOSETOR): SetorService {
        return this.pipeProducao.getSetorInChain(setor);
    }

    //mudar para que pegue o primeiro do item nao da fabrica
    getFirstSetor(): SetorService {
        return this.pipeProducao;
    }

    // modificarCorrente(codigosAlvos: CODIGOSETOR[]): SetorService {
    //     const setores = this.pipeProducao.getSetoresInChain(codigosAlvos);

    // }
}