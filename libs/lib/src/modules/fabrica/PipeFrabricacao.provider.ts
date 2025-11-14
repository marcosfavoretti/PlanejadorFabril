import { SetorService } from '../planejamento/@core/abstract/SetorService';
import { SetorBanho } from '../planejamento/@core/services/SetorBanho';
import { SetorLixa } from '../planejamento/@core/services/SetorLixa';
import { SetorMontagem } from '../planejamento/@core/services/SetorMontagem';
import { SetorPinturaLiq } from '../planejamento/@core/services/SetorPinturaliq';
import { SetorPinturaPo } from '../planejamento/@core/services/SetorPinturaPo';
import { SetorSolda } from '../planejamento/@core/services/SetorSolda';

export const PIPE_FABRICACAO = Symbol('PIPE_FABRICACAO');

export const PipeFrabricacaoProvider = {
  provide: PIPE_FABRICACAO,
  inject: [
    SetorSolda,
    SetorLixa,
    SetorBanho,
    SetorPinturaLiq,
    SetorPinturaPo,
    SetorMontagem,
  ],
  useFactory: (
    solda: SetorSolda,
    lixa: SetorLixa,
    banho: SetorBanho,
    pliq: SetorPinturaLiq,
    ppo: SetorPinturaPo,
    montagem: SetorMontagem,
  ): SetorService => {
    solda
      .setNextSetor(lixa)
      .setNextSetor(banho)
      .setNextSetor(pliq)
      .setNextSetor(ppo)
      .setNextSetor(montagem);
    return solda;
  },
};
