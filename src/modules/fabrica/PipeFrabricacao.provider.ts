import { SetorService } from "../planejamento/@core/abstract/SetorService";
import { SetorBanho } from "../planejamento/@core/services/SetorBanho";
import { SetorLixa } from "../planejamento/@core/services/SetorLixa";
import { SetorMontagem } from "../planejamento/@core/services/SetorMontagem";
import { SetorPinturaLiq } from "../planejamento/@core/services/SetorPinturaliq";
import { SetorSolda } from "../planejamento/@core/services/SetorSolda";

export const PipeFrabricacaoProvider = {
    provide: 'PIPE_FABRICACAO',
    inject: [
        SetorSolda,
        SetorLixa,
        SetorBanho,
        SetorPinturaLiq,
        SetorMontagem
    ],
    useFactory: (
        solda: SetorSolda,
        lixa: SetorLixa,
        banho: SetorBanho,
        pliq: SetorPinturaLiq,
        montagem: SetorMontagem,
    ): SetorService => {
        solda
            .setNextSetor(lixa)
            .setNextSetor(banho)
            .setNextSetor(pliq)
            .setNextSetor(montagem);
        return solda;
    }
};