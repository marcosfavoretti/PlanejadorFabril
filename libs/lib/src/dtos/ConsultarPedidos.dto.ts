import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum TIPO_CONSULTA {
  'planejados' = 'planejados',
  'n_planejados' = 'n_planejados',
  'todos' = 'todos',
}

export class ConsultarPedidosDTO {
  @ApiProperty({
    enum: TIPO_CONSULTA,
  })
  @IsEnum(TIPO_CONSULTA)
  tipoConsulta: TIPO_CONSULTA;
}
