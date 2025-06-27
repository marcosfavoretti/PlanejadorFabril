import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import * as datefns from "date-fns";
import { Item } from "./Item.entity";

@Entity()
export class Pedido {
    @PrimaryGeneratedColumn("increment")
    id: string;

    @Column()
    codigo: string;

    @Column({ type: "date" })
    dataEntrega: Date;

    @Column()
    lote: number;

    @Column({ default: false, type: 'boolean' })
    processado: boolean;

    // Relations
    @ManyToOne(() => Item, { eager: true })
    item: Item;

    // Not mapped to DB
    private shipDate: Date;

    constructor(
        codigo?: string,
        dataEntrega?: Date,
        item?: Item,
        lote?: number,
        processado?: boolean
    ) {
        if (codigo) this.codigo = codigo;
        if (dataEntrega) {
            this.dataEntrega = datefns.startOfDay(dataEntrega);
            this.shipDate = datefns.startOfDay(datefns.addDays(this.dataEntrega, 1));
        }
        if (item) this.item = item;
    }

    getProcessado(): boolean {
        return this.processado;
    }

    getSafeDate(): Date {
        return datefns.startOfDay(datefns.subDays(this.dataEntrega, 0));
    }

    getCodigo(): string {
        return this.codigo;
    }

    getDataEntrega(): Date {
        return this.dataEntrega;
    }

    getShipDate(): Date {
        // Recalculate if not set (for entities loaded from DB)
        if (this.shipDate && this.dataEntrega) {
            this.shipDate = datefns.addDays(this.dataEntrega, 1);
        }
        return this.shipDate;
    }

    getItem(): Item {
        return this.item;
    }

    getLote(): number {
        return this.lote;
    }
}