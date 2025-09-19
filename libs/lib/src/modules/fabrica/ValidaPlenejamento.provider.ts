import { Provider } from "@nestjs/common";
import { ValidaData } from "./@core/services/ValidaData";

export const ValidadorPlanejamento = Symbol('ValidadorPlanejamento');

export const ValidadorPlanejamentoProvider: Provider = {
    provide: ValidadorPlanejamento,
    useFactory: (
        validaData: ValidaData
    ) => [
        // validaData
    ],
    inject: [
        ValidaData
    ]
}
