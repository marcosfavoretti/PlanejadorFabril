import { Inject, Logger } from "@nestjs/common";
import { MetodoDeAlocacao } from "src/modules/planejamento/@core/abstract/MetodoDeAlocacao";
import { SetorService } from "src/modules/planejamento/@core/abstract/SetorService";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

export class SetorChainFactoryService {
    @Inject('PIPE_FABRICACAO') private pipeProducao: SetorService
    logger = new Logger();

    getSetor(setor: CODIGOSETOR): SetorService {
        return this.pipeProducao.getSetorInChain(setor);
    }

    //mudar para que pegue o primeiro do item nao da fabrica
    getFirstSetor(): SetorService {
        return this.pipeProducao;
    }

    setMetodoDeAlocacaoCustomTodos(pipeProducaoCustom: SetorService, setores: CODIGOSETOR[], metodoDeAlocacao: MetodoDeAlocacao): SetorService {
        const pipeAsList = pipeProducaoCustom.getSetoresInChain(setores);
        console.log(pipeAsList.map(a=>a.getSetorCode()))
        pipeAsList.forEach(pipe => pipe.setMetodoDeAlocacao(metodoDeAlocacao));
        return pipeProducaoCustom;
    }

    modificarCorrente(codigosAlvos: CODIGOSETOR[]): SetorService {
        const setoresService = this.pipeProducao.getSetoresInChainClone(codigosAlvos);
        for (let i = 0; i < setoresService.length - 1; i++) {
            setoresService[i].setNextSetor(setoresService[i + 1]);
        }
        this.logger.log(`___SETOR MODIFICADO___\n${setoresService.map(s => s.getSetorCode())}`, 'SETOR IN CHAIN FACTORY');
        return setoresService[0];
    }
}