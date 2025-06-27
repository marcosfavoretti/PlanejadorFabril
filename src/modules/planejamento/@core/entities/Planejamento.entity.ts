import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from "typeorm";
import { Item } from "./Item.entity";
import { Pedido } from "./Pedido.entity";
import { PlanejamentoDiario } from "./PlanejamentoDiario.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

@Entity()
export class Planejamento {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Item, { eager: true })
    item: Item;

    @Column("int")
    qtd: number;

    @Column({
        enum: CODIGOSETOR
    })
    setor: CODIGOSETOR;

    @ManyToOne(() => Pedido, { eager: true })
    pedido: Pedido;

    @ManyToOne(()=> PlanejamentoDiario, plan=> plan.planejamentos)
    planejamentoDiario: PlanejamentoDiario;
}
