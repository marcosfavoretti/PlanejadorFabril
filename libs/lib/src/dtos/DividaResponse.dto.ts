import { ApiProperty } from '@nestjs/swagger';

export class DividaResponseDTO {
  @ApiProperty()
  dividaId: number;

  @ApiProperty()
  qtd: number;

  @ApiProperty()
  pedidoId: number;

  @ApiProperty()
  setorCodigo: string;

  @ApiProperty()
  createdAt: Date;
}
