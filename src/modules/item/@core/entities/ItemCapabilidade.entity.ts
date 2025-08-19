import { Item } from "src/modules/item/@core/entities/Item.entity";
import { Setor } from "src/modules/setor/@core/entities/Setor.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ItemCapabilidade {
    @PrimaryGeneratedColumn()
    itemDetailId: number;

    @ManyToOne(() => Setor, {eager: true})
    @JoinColumn({name: 'setor'})
    setor: Setor

    @Column('int')
    capabilidade: number;

    @Column('int')
    leadTime: number;

    @ManyToOne(() => Item)
    @JoinColumn({name: 'item'})
    item: Item;
}