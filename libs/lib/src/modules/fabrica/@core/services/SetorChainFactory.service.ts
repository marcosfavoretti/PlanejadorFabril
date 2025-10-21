import { Inject, Logger } from "@nestjs/common";
import { MetodoDeAlocacao } from "@libs/lib/modules/planejamento/@core/abstract/MetodoDeAlocacao";
import { SetorService } from "@libs/lib/modules/planejamento/@core/abstract/SetorService";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { PIPE_FABRICACAO } from "../../PipeFrabricacao.provider";
import { MetodoDeReAlocacao } from "@libs/lib/modules/replanejamento/@core/abstract/MetodoDeReAlocacao";

export class SetorChainFactoryService {
    @Inject(PIPE_FABRICACAO) private pipeProducao: SetorService;

    logger = new Logger();

    getSetor(setor: CODIGOSETOR): SetorService {
        return this.pipeProducao.getSetorInChain(setor);
    }

    //mudar para que pegue o primeiro do item nao da fabrica
    getFirstSetor(): SetorService {
        return this.pipeProducao;
    }


    getSetoresAsList(): CODIGOSETOR[] {
        const setores: CODIGOSETOR[] = []
        let setorCorrente = this.pipeProducao;
        setores.push(setorCorrente.getSetorCode());
        while(setorCorrente.getNextSetor()){
            setorCorrente = setorCorrente.getNextSetor()!
            setores.push(setorCorrente.getSetorCode())
        }
        return setores;
    }

    setMetodoDeAlocacaoCustomTodos(pipeProducaoCustom: SetorService, setores: CODIGOSETOR[], metodoDeAlocacao: MetodoDeAlocacao): SetorService {
        const pipeAsList = pipeProducaoCustom.getSetoresInChain(setores);
        pipeAsList.forEach(pipe => pipe.setMetodoDeAlocacao(metodoDeAlocacao));
        return pipeProducaoCustom;
    }

    setMetodoDeAlocacaoCustomUnico(pipeProducaoCustom: SetorService, setor: CODIGOSETOR, metodoDeAlocacao: MetodoDeAlocacao): SetorService {
        const setorService = pipeProducaoCustom.getSetorInChain(setor);
        setorService.setMetodoDeAlocacao(metodoDeAlocacao);
        return pipeProducaoCustom;
    }


    setMetodoDeRealocacaoCustomTodos(pipeProducaoCustom: SetorService, setores: CODIGOSETOR[], metodoDeReAlocacao: MetodoDeReAlocacao): SetorService {
        const pipeAsList = pipeProducaoCustom.getSetoresInChain(setores);
        pipeAsList.forEach(pipe => pipe.setMetodoDeReAlocacao(metodoDeReAlocacao));
        return pipeProducaoCustom;
    }

    setMetodoDeRealocacaoCustomUnico(pipeProducaoCustom: SetorService, setor: CODIGOSETOR, metodoDeReAlocacao: MetodoDeReAlocacao): SetorService {
        const setorService = pipeProducaoCustom.getSetorInChain(setor);
        setorService.setMetodoDeReAlocacao(metodoDeReAlocacao);
        return pipeProducaoCustom;
    }
    /**
     * 
     * @param codigosAlvos 
     * @param corrente 
     * @description essa funcao cria com base nos setores e na corrente principal o pipeline do produto. Os SetoresServices retornados nao são a referencia do pipe principla possibilitando alterações
     * @returns 
     */
    modificarCorrente(codigosAlvos: CODIGOSETOR[], corrente?: SetorService): SetorService {
        const setoresService = (corrente || this.pipeProducao).getSetoresInChainClone(codigosAlvos);
        for (let i = 0; i < setoresService.length - 1; i++) {
            setoresService[i].setNextSetor(setoresService[i + 1]);
        }
        this.logger.log(`___SETOR MODIFICADO___\n${setoresService.map(s => s.getSetorCode())}`, 'SETOR IN CHAIN FACTORY');
        return setoresService[0];
    }
}