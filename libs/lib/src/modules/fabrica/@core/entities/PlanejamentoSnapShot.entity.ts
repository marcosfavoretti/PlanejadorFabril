import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { Fabrica } from "./Fabrica.entity";
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { SnapShotEstados } from "../enum/SnapShotEstados.enum";

@Entity()
export class PlanejamentoSnapShot {
  @PrimaryGeneratedColumn()
  planejamentoSnapShotId: number;

  @ManyToOne(() => Fabrica)
  @JoinColumn({ name: 'fabricaId' })
  fabrica: Fabrica;

  @ManyToOne(() => Planejamento, { eager: true, cascade: ['insert'] })
  @JoinColumn({ name: 'planejamentoId' }) 
  planejamento: Planejamento;

  @Column({ default: 'base', type: 'varchar'})
  tipoAcao: SnapShotEstados;

  copy(): PlanejamentoSnapShot {
    const novo = new PlanejamentoSnapShot();
    novo.tipoAcao = this.tipoAcao;
    novo.planejamento = this.planejamento;
    return novo;
  }

  deepCopy(): PlanejamentoSnapShot {
    const novo = new PlanejamentoSnapShot();
    novo.tipoAcao = this.tipoAcao;
    novo.planejamento = this.planejamento.copy();
    return novo;
  }
}
