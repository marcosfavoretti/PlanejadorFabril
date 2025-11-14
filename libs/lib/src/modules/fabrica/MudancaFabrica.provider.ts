import { Provider } from '@nestjs/common';
import { MudancaPedido } from './@core/services/MudancaPedido';
import { IComparaMudancasFabrica } from './@core/interfaces/IComparaMudancasFabricas';
import { MudancaPlanejamento } from './@core/services/MudancaPlanejamento';
import { MudancaQtdPlanejamento } from './@core/services/MudancaQtdPlanejamento';

export const MudancaFabricaEstrategias = Symbol('MudancaFabricaEstrategias');

export const ValidMudancaFabricaEstrategiasProvider: Provider = {
  provide: MudancaFabricaEstrategias,
  useFactory: (
    mp: IComparaMudancasFabrica,
    mpp: IComparaMudancasFabrica,
    mqtd: IComparaMudancasFabrica,
  ): IComparaMudancasFabrica[] => [mp, mpp, mqtd],
  inject: [MudancaPedido, MudancaPlanejamento, MudancaQtdPlanejamento],
};
