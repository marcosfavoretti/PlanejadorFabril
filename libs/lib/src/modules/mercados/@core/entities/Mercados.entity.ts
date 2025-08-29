import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mercado {
  @PrimaryGeneratedColumn()
  mercadoId: number;

  @Column({ type: 'date' })
  data: Date;

  @ManyToOne(() => Setor)
  @JoinColumn({name: 'setor'})
  setor: Setor;

  @ManyToOne(() => Item)
  @JoinColumn({name: 'item'})
  item: Item;

  @Column('int')
  qtd: number;
}
