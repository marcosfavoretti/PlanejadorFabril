import { ApiProperty } from '@nestjs/swagger';

export class GetMercadosEntreSetoresTabelaDto {
  @ApiProperty()
  dia: Date;

  @ApiProperty()
  item: string;

  @ApiProperty()
  operacao: string;

  @ApiProperty()
  planejado: number;

  @ApiProperty()
  produzido: number;

  @ApiProperty()
  qtdmercado: number;
}
