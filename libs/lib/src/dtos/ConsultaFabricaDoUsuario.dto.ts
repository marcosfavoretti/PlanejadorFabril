import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConsultaFabricaDoUsuarioDTO {
  @IsString()
  @ApiProperty()
  userId: string;
}
