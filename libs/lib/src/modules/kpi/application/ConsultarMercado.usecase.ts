import { Inject } from '@nestjs/common';
import { GetMercadosEntreSetoresTabelaDto } from '@dto/GetMercadosEntreSetores.dto';
import { LinkMercadoComProdService } from '../infra/services/LinkMercadoComProd.service';
import { MercadoSnapShotService } from '@libs/lib/modules/fabrica/infra/service/MercadoSnapShot.service';

export class ConsultarMercadoUseCase {
  constructor(
    @Inject(MercadoSnapShotService)
    private mercadoSnapShotService: MercadoSnapShotService,
    @Inject(LinkMercadoComProdService)
    private linkMercadoComProdService: LinkMercadoComProdService,
  ) {}

  async consultar(): Promise<GetMercadosEntreSetoresTabelaDto[]> {
    // const mercados = await this.mercadoSnapShotService.consultarMercados(fabrica);
    // const logs = Array.from(this.mercadoLog.find().entries());
    // return await this.linkMercadoComProdService.link(logs);
    return [];
  }
}
