import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fabrica } from "./Fabrica.entity";
import { Divida } from "./Divida.entity";
import { SnapShotEstados } from "../enum/SnapShotEstados.enum";

@Entity()
export class DividaSnapShot {
    @PrimaryGeneratedColumn()
    dividaSnapShotId: number;
 
    @ManyToOne(() => Fabrica)
    @JoinColumn({ name: 'fabricaId' })
    fabrica: Fabrica;

    @ManyToOne(() => Divida, { eager: true, cascade: ['insert'] })
    @JoinColumn({ name: 'dividaId' })
    divida: Divida;

    @Column({ enum: SnapShotEstados })
    tipo: SnapShotEstados;

    @Column({ nullable: true })
    origem?: 'manual' | 'calculo' | 'falha_alocacao';


    copy(): DividaSnapShot {
        const novo = new DividaSnapShot();
        novo.tipo = this.tipo;
        novo.divida = this.divida;
        return novo;
    }

    deepCopy(): DividaSnapShot {
        const novo = new DividaSnapShot();
        novo.tipo = this.tipo;
        novo.divida = this.divida.copy();
        return novo;
    }
}