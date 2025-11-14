import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ReplanejarPedidoDTO {
  @ApiProperty()
  @IsString()
  fabricaId: string;

  @ApiProperty()
  @IsNumber()
  pedidoId: number;
}
