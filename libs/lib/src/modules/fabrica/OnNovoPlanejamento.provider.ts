import { Provider } from "@nestjs/common";
import { IOnNovoPlanejamentos } from "./@core/interfaces/IOnNovoPlanejamento";
import { TabelaProducao } from "../planejamento/@core/entities/TabelaProducao.entity";
import { GerenciaDividaService } from "./infra/service/GerenciaDivida.service";
import { TabelaProducaoService } from "../planejamento/infra/services/TabelaProducao.service";

export const OnNovoPlanejamento = Symbol('OnNovoPlanejamento');

export const OnNovoPlanejamentoProvider: Provider = {
    provide: OnNovoPlanejamento,
    useFactory: (
        tbProd: IOnNovoPlanejamentos,
        gDivida: IOnNovoPlanejamentos
    ) => [],
    inject: [
        TabelaProducaoService,
        GerenciaDividaService
    ]
}