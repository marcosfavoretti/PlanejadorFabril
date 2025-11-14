import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { OqColorirGantt } from '@libs/lib/modules/kpi/@core/enum/OqueColorirGantt.enum';

export class ConsultarGanttDTO {
  @ApiProperty()
  @IsString()
  fabricaId: string;

  @ApiProperty({
    enum: OqColorirGantt,
  })
  @IsEnum(OqColorirGantt)
  colorir: OqColorirGantt;
}
