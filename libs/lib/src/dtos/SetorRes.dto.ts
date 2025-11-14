import { ApiProperty } from '@nestjs/swagger';
import { CODIGOSETOR } from '../modules/planejamento/@core/enum/CodigoSetor.enum';

export class SetorResDTO {
  @ApiProperty()
  codigo: CODIGOSETOR;

  @ApiProperty()
  nome: string;
}
