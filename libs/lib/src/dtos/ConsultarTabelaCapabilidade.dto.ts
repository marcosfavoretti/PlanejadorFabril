import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { ItemResDto } from './ItemRes.dto';
import { Type } from 'class-transformer';

export class ConsultarTabelaCapabilidadeDTO {
  @ApiProperty({ description: 'item e apelido do item', type: ItemResDto })
  @ValidateNested() // <--- ADICIONE ISTO
  @Type(() => ItemResDto)
  item: ItemResDto;

  @ApiProperty({
    description: 'Capabilidade por setor',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      '00015': 2,
      '00025': 4,
    },
  })
  @IsObject()
  capabilidade: Record<CODIGOSETOR, number>;

  @ApiProperty({
    description: 'Lead time por setor',
    type: 'object',
    additionalProperties: { type: 'number' },
    example: {
      '00015': 2,
      '00025': 4,
    },
  })
  @IsObject()
  leadtime: Record<CODIGOSETOR, number>;

  static fromEntities(item: Item): ConsultarTabelaCapabilidadeDTO {
    const capabilidade_00011 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.DOBRA,
    );
    const capabilidade_00015 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.SOLDA,
    );
    const capabilidade_00017 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.LIXA,
    );
    const capabilidade_00025 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.MONTAGEM,
    );
    const capabilidade_00035 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.BANHO,
    );
    const capabilidade_00050 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.PINTURALIQ,
    );
    const capabilidade_00020 = item.itemCapabilidade.find(
      (cap) => cap.setor.codigo === CODIGOSETOR.PINTURAPO,
    );

    return {
      item: {
        Item: item.Item,
        tipo_item: item.tipo_item,
      },
      capabilidade: {
        '00011': capabilidade_00011?.capabilidade || 0,
        '00015': capabilidade_00015?.capabilidade || 0,
        '00017': capabilidade_00017?.capabilidade || 0,
        '00025': capabilidade_00025?.capabilidade || 0,
        '00035': capabilidade_00035?.capabilidade || 0,
        '00050': capabilidade_00050?.capabilidade || 0,
        '00020': capabilidade_00020?.capabilidade || 0,
      },
      leadtime: {
        '00011': capabilidade_00011?.leadTime || 0,
        '00015': capabilidade_00015?.leadTime || 0,
        '00017': capabilidade_00017?.leadTime || 0,
        '00025': capabilidade_00025?.leadTime || 0,
        '00035': capabilidade_00035?.leadTime || 0,
        '00050': capabilidade_00050?.leadTime || 0,
        '00020': capabilidade_00020?.leadTime || 0,
      },
    };
  }
}
