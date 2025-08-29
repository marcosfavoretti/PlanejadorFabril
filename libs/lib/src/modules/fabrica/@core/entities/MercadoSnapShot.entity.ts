import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fabrica } from "./Fabrica.entity";
import { Mercado } from "@libs/lib/modules/mercados/@core/entities/Mercados.entity";

@Entity()
export class MercadoSnapShot {
    @PrimaryGeneratedColumn()
    mercadoSnapShotId: number;

    @ManyToOne(() => Fabrica)
    @JoinColumn({name: 'fabricaId'})
    fabrica: Fabrica;

    @ManyToOne(() => Mercado)
    @JoinColumn({name: 'mercadoId'})
    mercado: Mercado;
}