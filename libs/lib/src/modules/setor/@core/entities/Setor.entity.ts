import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Setor {
  @PrimaryColumn({
    type: 'varchar',
  })
  codigo: CODIGOSETOR;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  nome: string;
}
