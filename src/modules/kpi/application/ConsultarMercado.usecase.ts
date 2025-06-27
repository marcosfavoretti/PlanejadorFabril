import { Inject } from "@nestjs/common";
import { GetMercadosEntreSetoresTabelaDto } from "src/delivery/dtos/GetMercadosEntreSetores.dto";
import { MercadoLogStoreService } from "src/modules/planejamento/@core/services/MercadoLogStore.service";
import { LinkMercadoComProdService } from "../infra/services/LinkMercadoComProd.service";

export class ConsultarMercadoUseCase {
    constructor(
        @Inject(MercadoLogStoreService) private mercadoLog: MercadoLogStoreService,
        @Inject(LinkMercadoComProdService) private linkMercadoComProdService: LinkMercadoComProdService,
    ) { }

    async consultar(): Promise<GetMercadosEntreSetoresTabelaDto[]> {
        const logs = Array.from(this.mercadoLog.find().entries());
        return await this.linkMercadoComProdService.link(logs);
    }
}