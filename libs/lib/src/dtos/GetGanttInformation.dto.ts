import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsInt,
  ValidateIf,
  IsDate
} from 'class-validator';

export class GanttData {
  @ApiPropertyOptional({ description: 'ID da tarefa' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Nome da tarefa' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Data de início da tarefa (formato ISO)' })
  @IsNotEmpty()
  @IsDateString()
  start: string;

  @ApiPropertyOptional({ description: 'Data de término da tarefa (formato ISO)' })
  @IsOptional()
  @IsDateString()
  end?: string;

  @ApiPropertyOptional({ description: 'Duração da tarefa' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiProperty({ description: 'Progresso da tarefa de 0 a 100' })
  @IsNotEmpty()
  @IsNumber()
  progress: number;

  @ApiPropertyOptional({
    description: 'Dependências da tarefa (ID de outras tarefas)',
    type: [String],
  })
  @IsOptional()
  @ValidateIf(o => typeof o.dependencies === 'string' || Array.isArray(o.dependencies))
  dependencies?: string | string[];

  @ApiPropertyOptional({ description: 'Classe CSS customizada para estilização' })
  @IsOptional()
  @IsString()
  custom_class?: string;

  @ApiPropertyOptional({ description: 'Cor principal da barra (hex ou nome CSS)' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Cor da barra de progresso' })
  @IsOptional()
  @IsString()
  color_progress?: string;

  // @ApiPropertyOptional({ description: 'Data de início já parseada (uso interno)', type: Date })
  // @IsDate()
  // @IsOptional()
  // _start?: Date;

  // @ApiPropertyOptional({ description: 'Data de término já parseada (uso interno)', type: Date })
  // @IsDate()
  // @IsOptional()
  // _end?: Date;

  @ApiPropertyOptional({ description: 'Índice da tarefa (uso interno)' })
  @IsOptional()
  @IsInt()
  _index?: number;
}

export class GanttLegendaDto{
  @ApiProperty()
  @IsString()
  legenda: string;

  @ApiProperty()
  @IsString()
  cor: string;
}
export class GetGanttInformationDto {
  @ApiProperty({
    type: GanttData,
    isArray: true
  })
  data: GanttData[];

  @ApiProperty({
    type: GanttLegendaDto,
    isArray: true
  })
  legenda: GanttLegendaDto[]
}
