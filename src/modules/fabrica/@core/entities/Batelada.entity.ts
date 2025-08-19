import { Item } from "src/modules/item/@core/entities/Item.entity";
import { Setor } from "src/modules/setor/@core/entities/Setor.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Batelada {
    @PrimaryGeneratedColumn('increment')
    bateladaId: number;

    @ManyToOne(() => Setor)
    @JoinColumn({ name: 'setorid' })
    setor: Setor;

    @ManyToOne(() => Item)
    @JoinColumn({ name: 'item' })
    item: Item;

    // @Column({
    //     default: () => `DATETIME('now', 'localtime')`,
    //     type: 'datetime'
    // })
    @CreateDateColumn()
    dia: Date;

    qtd: number;
}