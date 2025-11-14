import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class VirtualDate {
  @PrimaryGeneratedColumn('increment')
  idVirtualDate: number;

  @Column('datetime')
  virtualDate: Date;

  // @Column()
  // userId
}
