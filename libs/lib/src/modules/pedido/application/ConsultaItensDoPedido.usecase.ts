import { Inject, InternalServerErrorException } from '@nestjs/common';
import { IMontaEstrutura } from '../../item/@core/interfaces/IMontaEstrutura.ts';
import { PedidoService } from '../infra/service/Pedido.service';
import { ItemResDto } from '@dto/ItemRes.dto';
import { ConsultartPorPedidoDto } from '@dto/ConsultarPedido.dto';

export class ConsultaItensDoPedidoUseCase {
  constructor(
    @Inject(PedidoService) private pedidoService: PedidoService,
    @Inject(IMontaEstrutura) private montaEstrutura: IMontaEstrutura,
  ) {}

  async consulta(dto: ConsultartPorPedidoDto): Promise<ItemResDto[]> {
    try {
      const pedidoId = Number(dto.pedidoId);
      if (Number.isNaN(pedidoId)) throw new Error('Id do pedido errado');
      const pedido = await this.pedidoService.consultarPedido(pedidoId);
      const estrutura = await this.montaEstrutura.monteEstrutura(
        pedido.getItem(),
      );
      return estrutura.itensAsList().map(ItemResDto.createByEntity);
    } catch (error) {
      throw new InternalServerErrorException(
        `Nao foi possível consultar os itens do pedido \n${error}`,
      );
    }
  }
}
