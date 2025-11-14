import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class ResetaFabricaDTO {
  @ApiProperty()
  @IsString()
  fabricaId: string;
}
