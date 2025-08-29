import { Entity, PrimaryColumn, OneToMany } from "typeorm";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { ItemCapabilidade } from "./ItemCapabilidade.entity";

@Entity({name: 'item_x_qtdsemana', synchronize: false})
// @Entity()
export class Item {
    @PrimaryColumn()
    Item: string;

    @OneToMany(() => ItemCapabilidade, item => item.item, { eager: true, cascade: true })
    itemCapabilidade: ItemCapabilidade[];

    getCodigo(): string {
        return this.Item;
    }

    toString(): string {
        return this.Item;
    }

    getLeadtime(setor: CODIGOSETOR): number {
        const result = this.itemCapabilidade.find((c) => c.setor.codigo === setor) || Error('Não foi achada a operação no item');
        if (result instanceof Error) throw result;
        return result.leadTime;
    }

    capabilidade(setor: CODIGOSETOR): number {
        const result = this.itemCapabilidade.find((c) => c.setor.codigo === setor) || Error('Não foi achada a operação no item');
        if (result instanceof Error) throw result;
        return result.capabilidade;
    }
}