import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Planejamento } from "./Planejamento.entity";

@Entity()
export class PlanejamentoDiario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "datetime" })
    dia: Date;

    @OneToMany(() => Planejamento, planejamento => planejamento.planejamentoDiario, { cascade: true })
    planejamentos: Planejamento[];
}
