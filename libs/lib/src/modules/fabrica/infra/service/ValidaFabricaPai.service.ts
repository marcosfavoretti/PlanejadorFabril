import { Inject } from "@nestjs/common";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { IValidaFabrica } from "../../@core/interfaces/IValidaFabrica";
import { FabricaService } from "./Fabrica.service";
import { FabricaExpirada } from "../../@core/exception/FabricaExpirada.exception";

export class ValidaFabricaPai implements IValidaFabrica {
    @Inject(FabricaService) private fabricaService: FabricaService
    async valide(fabrica: Fabrica): Promise<void> {
        const fabricapai = await this.fabricaService.consultaFabricaPrincipal();
        if (fabricapai?.fabricaId !== fabrica.fabricaPai!.fabricaId) {
            throw new FabricaExpirada(fabrica);
        }
    }
}