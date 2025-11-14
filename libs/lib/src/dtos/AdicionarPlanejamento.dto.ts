import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from 'class-validator';
import { CODIGOSETOR } from '../modules/planejamento/@core/enum/CodigoSetor.enum';

export class AdicionarPlanejamentoDTO {
  @ApiProperty()
  @IsString()
  fabricaId: string;

  @ApiProperty()
  @IsInt()
  pedidoId: number;

  @ApiProperty()
  @IsString()
  item: string;

  @ApiProperty({
    enum: CODIGOSETOR,
  })
  @IsString()
  setor: CODIGOSETOR;

  @ApiProperty({ nullable: true })
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date())
  dia: Date;

  @ApiProperty()
  @Min(0)
  @IsInt()
  qtd: number;
}
