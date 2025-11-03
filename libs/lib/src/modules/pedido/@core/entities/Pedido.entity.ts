import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from "typeorm";
import * as datefns from "date-fns";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { config } from "dotenv";
config()

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column()
    codigo: string;

    @Column({ type: "datetime" })
    dataEntrega: Date;

    @Column()
    lote: number;

    @Column(process.env.BD === 'PROD' ? 'bit' : 'boolean', { default: false })
    processado: boolean;

    @ManyToOne(() => Item, { eager: true })
    @JoinColumn({ name: 'item' })
    item: Item;

    @CreateDateColumn()
    dataImportacao: Date;

    @OneToMany(() => Planejamento, plan => plan.pedido, { onDelete: 'CASCADE' })
    planejamentos: Planejamento[];

    @Column('nvarchar')
    hash: string;

    private shipDate: Date;

    constructor(
        codigo?: string,
        dataEntrega?: Date,
        item?: Item,
        lote?: number,
        processado?: boolean,
        hash?: string
    ) {
        if (hash) this.hash = hash
        if (codigo) this.codigo = String(codigo);
        if (dataEntrega) {
            this.dataEntrega = datefns.startOfDay(dataEntrega);
            this.shipDate = datefns.startOfDay(datefns.addDays(this.dataEntrega, 1));
        }
        if (lote) this.lote = lote;
        this.processado = !!processado
        if (item) this.item = item;
    }

    ehUrgente(): boolean {
        return datefns.differenceInBusinessDays(this.dataEntrega, new Date()) < 5;
    }


    getSafeDate(): Date {
        return datefns.startOfDay(datefns.subDays(this.dataEntrega, 0));
    }

    getShipDate(): Date {
        // Recalculate if not set (for entities loaded from DB)
        if (this.shipDate && this.dataEntrega) {
            this.shipDate = datefns.addDays(this.dataEntrega, 1);
        }
        return this.shipDate;
    }

    pedidoEhValido(): boolean {
        return !!this.item && !!this.item.itemCapabilidade
    }

    processaPedido(): void {
        this.processado = true;
    }

    getItem(): Item {
        return this.item;
    }

    getLote(): number {
        return this.lote;
    }

}