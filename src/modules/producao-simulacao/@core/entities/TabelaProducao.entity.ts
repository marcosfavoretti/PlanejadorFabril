import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tabela_producao')
export class TabelaProducao{
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('datetime')
    date_planej: Date;

    @ManyToOne(()=> Planejamento, planejamento => planejamento.id)
    @JoinColumn({name: 'planejamento'})
    planejamento: Planejamento;

    @Column('int', {default: 0})
    produzido: number;
}