import { Inject } from "@nestjs/common";
import { MercadoSnapShotRepository } from "../repository/MercadoSnapShot.repository";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { MercadoSnapShot } from "../../@core/entities/MercadoSnapShot.entity";
import { MercadoOverWriteService } from "../../@core/services/MercadoOverWrite.service";

export class MercadoSnapShotService {
    private mercadoOverWriteService: MercadoOverWriteService;
    constructor(
        @Inject(MercadoSnapShotRepository) private mercadoSnapShotRepository: MercadoSnapShotRepository
    ) { }

    async consultarMercados(fabrica: Fabrica): Promise<MercadoSnapShot[]> {
        const mercadoSnapShot = await this.mercadoSnapShotRepository.find({
            where: {
                fabrica: fabrica
            }
        });
        const mercadoOverwrite = this.mercadoOverWriteService.manager(mercadoSnapShot);
        return mercadoOverwrite;
    }
}