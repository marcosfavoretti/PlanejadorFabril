import { ApiProperty } from '@nestjs/swagger';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { ItemResDto } from './ItemRes.dto';

export class PedidoResponseDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  dataEntrega: Date;

  @ApiProperty()
  isfake: boolean;

  @ApiProperty()
  lote: number;

  @ApiProperty()
  processado: boolean;

  @ApiProperty()
  item: ItemResDto;

  static fromEntity(pedido: Pedido): PedidoResponseDTO {
    const novo = new PedidoResponseDTO();
    novo.codigo = pedido.codigo;
    novo.dataEntrega = pedido.dataEntrega;
    novo.id = pedido.id;
    novo.item = {
      Item: pedido.item?.Item || 'FALTANDO_CADASTRO',
      tipo_item: pedido.item?.tipo_item || 'FALTANDO_CADASTRO',
    };
    novo.lote = pedido.lote;
    novo.processado = pedido.processado;
    return novo;
  }
}
