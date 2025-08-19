import { User } from "src/modules/user/@core/entities/User.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fabrica } from "./Fabrica.entity";

@Entity()
export class FabricaMudanca {
    @PrimaryGeneratedColumn()
    fabricaMudancaId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    autor: User;

    // @Column('json')
    // mudancaLog: any;

    @Column('text')
    mudancaLog: any;

    @Column({ type: 'date' })
    severTime: Date;

    @ManyToOne(() => Fabrica)
    @JoinColumn({ name: 'fabricaId' })
    fabrica: Fabrica;
}