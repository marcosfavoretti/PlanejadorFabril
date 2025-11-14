import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Fabrica } from './Fabrica.entity';
import { User } from '@libs/lib/modules/user/@core/entities/User.entity';

@Entity({ name: 'merge_request' })
export class MergeRequest {
  @PrimaryGeneratedColumn()
  mergeRequestId: number;

  @OneToOne(() => Fabrica, { eager: true })
  @JoinColumn({ name: 'fabricaid' })
  fabrica: Fabrica;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'feitoPor' })
  feitoPor: User;

  // fabricaMudanca

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: 'aceitoPor' })
  aceitoPor: User;

  @CreateDateColumn()
  criadaEm: Date;

  @Column({ type: 'datetime', nullable: true })
  aceitaEm: Date | null;
}
