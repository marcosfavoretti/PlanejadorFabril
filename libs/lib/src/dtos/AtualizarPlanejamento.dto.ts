import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from 'class-validator';
import { startOfToday } from 'date-fns';

export class AtualizarPlanejamentoDTO {
  @ApiProperty()
  @IsNumber()
  planejamendoId: number;

  @ApiProperty()
  @IsString()
  fabricaId: string;

  @ApiProperty({ minimum: 0, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  qtd: number;

  @ApiProperty({ nullable: true, type: Date })
  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(startOfToday())
  dia: Date;
}
