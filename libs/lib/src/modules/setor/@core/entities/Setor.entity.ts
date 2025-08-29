import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Setor {
    @PrimaryColumn({ enum: CODIGOSETOR, type: 'varchar' })
    codigo: CODIGOSETOR;

    @Column()
    nome: string;
}
