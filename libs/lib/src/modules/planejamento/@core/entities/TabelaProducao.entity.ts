import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Planejamento } from "./Planejamento.entity";

@Entity()
export class TabelaProducao {
  @PrimaryGeneratedColumn()
  tabelaProducaoId: number;

  @Column({ type: 'datetime' })
  datePlanej: Date;

  @ManyToOne(() => Planejamento)
  @JoinColumn({name: 'planejamentoId'})
  planejamento: Planejamento;

  @Column('int', {default: 0})
  produzido: number;
}