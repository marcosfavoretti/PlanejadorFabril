import { Inject } from "@nestjs/common";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { IGeraCheckPoint } from "../../@core/interfaces/IGeraCheckPoint";
import { DividaService } from "./Divida.service";

export class DividaCheckPoint implements
    IGeraCheckPoint {

    @Inject(DividaService) private dividaService: DividaService;

    /**
     * @param fabricaAtual 
     * @param fabricaPassada
     * @description adiciona por referencia na fabrica atual as depedencias sumarizadas dos ancestrais 
     */
    async gerar(fabricaAtual: Fabrica, fabricaPassada: Fabrica): Promise<void> {
        const dividas = await this.dividaService
            .consultarDividaDaFabrica(fabricaPassada);
        console.log(dividas)
        fabricaAtual
            .appendDividas(
                dividas.map(divida => divida.copy())
            );
    }
}