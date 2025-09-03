import { Entity, PrimaryColumn, OneToMany, Column } from "typeorm";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { ItemCapabilidade } from "./ItemCapabilidade.entity";

@Entity({name: 'item_x_qtdsemana'})
// @Entity()
export class Item {
    @PrimaryColumn()
    Item: string;

    @Column({nullable: true})
    tipo_item: string;

    @OneToMany(() => ItemCapabilidade, item => item.item, { eager: true, cascade: true })
    itemCapabilidade: ItemCapabilidade[];

    public getCodigo(): string {
        return this.Item;
    }

    public toString(): string {
        return this.Item;
    }

    public getLeadtime(setor: CODIGOSETOR): number {
        const result = this.itemCapabilidade.find((c) => c.setor.codigo === setor) || Error('Não foi achada a operação no item');
        if (result instanceof Error) throw result;
        return result.leadTime;
    }

    public capabilidade(setor: CODIGOSETOR): number {
        const result = this.itemCapabilidade.find((c) => c.setor.codigo === setor) || Error('Não foi achada a operação no item');
        if (result instanceof Error) throw result;
        return result.capabilidade;
    }
}