import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GerenciaCargo } from './GerenciaCargo.entity';
import { CargoEnum } from '../enum/CARGOS.enum';

@Entity()
export class Cargo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, enum: CargoEnum })
  nome: string;

  @Column({ nullable: true })
  descricao?: string;

  @OneToMany(() => GerenciaCargo, (gerencia) => gerencia.cargo)
  gerencias: GerenciaCargo[];
}
