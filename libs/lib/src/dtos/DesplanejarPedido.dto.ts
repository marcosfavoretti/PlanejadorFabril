import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, isArray, IsNumber, IsString, Min } from 'class-validator';

export class DesplanejarPedidoDto {
  @ApiProperty({ type: Number, isArray: true })
  @IsArray()
  @IsNumber({}, { each: true }) // valida cada item do array
  @Type(() => Number) // garante que cada item venha convertido para número
  pedidoIds: number[];

  @IsString()
  @ApiProperty()
  fabricaId: string;
}
