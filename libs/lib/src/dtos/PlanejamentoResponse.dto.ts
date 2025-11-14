import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { Planejamento } from '@libs/lib/modules/planejamento/@core/entities/Planejamento.entity';
import { ItemResDto } from './ItemRes.dto';
import { SetorResDTO } from './SetorRes.dto';

export class PlanejamentoResponseDTO {
  @ApiProperty()
  @IsInt()
  planejamentoId: number;

  @ApiProperty()
  item: ItemResDto;

  @ApiProperty()
  setor: SetorResDTO;

  @ApiProperty()
  pedido: string;

  @ApiProperty()
  dia: Date;

  @ApiProperty()
  @IsInt()
  qtd: number;

  static fromEntity(entity: Planejamento): PlanejamentoResponseDTO {
    const dto = new PlanejamentoResponseDTO();
    dto.planejamentoId = entity.planejamentoId;
    dto.item = { Item: entity.item.Item, tipo_item: entity.item.tipo_item };
    dto.setor = { codigo: entity.setor.codigo, nome: entity.setor.nome };
    dto.pedido = String(entity.pedido.id);
    dto.dia = entity.dia;
    dto.qtd = entity.qtd;
    return dto;
  }
}
