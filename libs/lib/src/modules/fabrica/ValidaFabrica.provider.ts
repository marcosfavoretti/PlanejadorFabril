import { Provider } from "@nestjs/common";
import { IValidaPlanejamento } from "./@core/interfaces/IValidaPlanejamento";
import { ValidaFabricaPai } from "./infra/service/ValidaFabricaPai.service";
import { ValidaFabricaPlanejamento } from "./infra/service/ValidaFabricaPlanejamento.service";

export const ValidaFabrica = Symbol('ValidaFabrica')

export const ValidaFabricaProvider: Provider = {
    provide: ValidaFabrica,
    useFactory: (fpai: IValidaPlanejamento, vPlan: IValidaPlanejamento): IValidaPlanejamento[] => [
        fpai,
        vPlan
    ],
    inject: [ValidaFabricaPai, ValidaFabricaPlanejamento]
}