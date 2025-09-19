import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Setor } from "@libs/lib/modules/setor/@core/entities/Setor.entity";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";

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
    @JoinColumn({ name: 'setorId' })
    setor: Setor;

    @ManyToOne(() => Item, {eager: true})
    @JoinColumn({name: 'Item'})
    item: Item;

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