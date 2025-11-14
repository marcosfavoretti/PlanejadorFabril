import { Item } from '@libs/lib/modules/item/@core/entities/Item.entity';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';

export interface IConsultaRoteiro {
  roteiro(partcode: Item): Promise<CODIGOSETOR[]>;
}
export const IConsultaRoteiro = Symbol('IConsultaRoteiro');
