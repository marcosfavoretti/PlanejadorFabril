import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Cargo } from './Cargo.entity';
import { User } from '@libs/lib/modules/user/@core/entities/User.entity';
@Entity()
export class GerenciaCargo {
  @PrimaryGeneratedColumn()
  gerenciaCargoId: number;

  @ManyToOne(() => User, (user) => user.cargos)
  user: User;

  @ManyToOne(() => Cargo, (cargo) => cargo.gerencias, { eager: true })
  cargo: Cargo;
}
