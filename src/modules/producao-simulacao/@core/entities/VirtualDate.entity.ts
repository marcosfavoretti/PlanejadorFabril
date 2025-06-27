import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity('VirtualDate')
export class VirtualDate{
    @PrimaryGeneratedColumn('increment')
    idVirtualDate: number;

    @Column('datetime')
    virtualDate: Date;

    // @Column()
    // userId
}