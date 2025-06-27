import { SetorService } from "./@core/abstract/SetorService";
import { SetorBanho } from "./@core/services/SetorBanho";
import { SetorLixa } from "./@core/services/SetorLixa";
import { SetorMontagem } from "./@core/services/SetorMontagem";
import { SetorPinturaLiq } from "./@core/services/SetorPinturaliq";
import { SetorSolda } from "./@core/services/SetorSolda";

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