import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fabrica } from "./Fabrica.entity";
import { Setor } from "src/modules/setor/@core/entities/Setor.entity";

@Entity()
export class Divida {
    @PrimaryGeneratedColumn()
    dividaId: number;

    @Column({ type: 'int' })
    qtd: number;

    @ManyToOne(() => Pedido, { eager: true })
    @JoinColumn({ name: 'pedidoId' })
    pedido: Pedido;

    @ManyToOne(() => Setor, { eager: true })
    @JoinColumn({ name: 'setodId' })
    setor: Setor;

    // @Column({
    //     default: () => `DATETIME('now', 'localtime')`,
    //     type: 'datetime'
    // })
    @CreateDateColumn()
    createdAt: Date;

    copy(): Divida {
        const novo = new Divida();
        novo.pedido = this.pedido;
        novo.qtd = this.qtd;
        novo.setor = this.setor;
        return novo;
    }
}