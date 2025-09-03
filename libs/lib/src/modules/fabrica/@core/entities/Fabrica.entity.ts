import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlanejamentoSnapShot } from "./PlanejamentoSnapShot.entity";
import { MercadoSnapShot } from "./MercadoSnapShot.entity";
import { FabricaBuilder } from "../builder/Fabrica.builder";
import { DividaSnapShot } from "./DividaSnapShot.entity";

@Entity({ name: 'fabrica' })
export class Fabrica {
    @PrimaryGeneratedColumn('uuid')
    fabricaId: string;

    // @Column({
    //     default: ()=> `DATETIME('now', 'localtime')`,
    //     type: 'datetime'
    // })
    @CreateDateColumn()
    date: Date;

    @DeleteDateColumn()
    deleted_at?: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column(process.env.BD === 'PROD' ? 'bit' : 'boolean')
    principal: boolean;

    @ManyToOne(() => Fabrica, fabrica => fabrica.childrenFabricas, { nullable: true })
    @JoinColumn({ name: 'fabricaPaiId' })
    fabricaPai?: Fabrica;

    @Column(process.env.BD === 'PROD' ? 'bit' : 'boolean')
    checkPoint: boolean;

    @OneToMany(() => Fabrica, fabrica => fabrica.fabricaPai)
    childrenFabricas: Fabrica[];

    @OneToMany(() => PlanejamentoSnapShot, plan => plan.fabrica, { onDelete: 'CASCADE', cascade: true, })
    planejamentoSnapShots: PlanejamentoSnapShot[];

    @OneToMany(() => DividaSnapShot, dividaSnapShot => dividaSnapShot.fabrica, { onDelete: 'CASCADE', cascade: true })
    dividasSnapShots: DividaSnapShot[];

    @OneToMany(() => MercadoSnapShot, mercado => mercado.fabrica, { onDelete: 'CASCADE', cascade: true })
    mercadoSnapShots: MercadoSnapShot[];

    enableCheckPoint(): void {
        this.checkPoint = true;
        1
    }

    appendDividas(dividas: DividaSnapShot[]): void {
        if (!this.dividasSnapShots) {
            this.dividasSnapShots = [];
        }
        this.dividasSnapShots.push(...dividas);
    }

    appendPlanejamento(planejamentoSnapShots: PlanejamentoSnapShot[]): void {
        if (!this.planejamentoSnapShots) {
            this.planejamentoSnapShots = [];
        }
        this.planejamentoSnapShots.push(...planejamentoSnapShots);
    }


    restart(): Fabrica {
        if (this.principal) throw new Error('disponível apenas em fabrica privadas');
        const nova = new FabricaBuilder()
            .checkPoint(false)
            .principal(this.principal)
            .fabricaPai(this.fabricaPai!)
            .userId(this.user)
            .build();
        nova.fabricaId = this.fabricaId;
        return nova;
    }

    copy(user: User, isPrincipal: boolean): Fabrica {
        return new FabricaBuilder()
            .checkPoint(false)
            .principal(isPrincipal)
            .fabricaPai(this)
            .userId(user)
            .build()
    }
}