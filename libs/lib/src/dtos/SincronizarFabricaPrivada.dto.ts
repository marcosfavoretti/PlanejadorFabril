import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SincronizarFabricaPrivadaDTO {
  @ApiProperty()
  @IsString()
  fabricaId: string;
}
