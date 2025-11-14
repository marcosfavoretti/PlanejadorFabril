import { DataSource, Repository } from 'typeorm';
import { PlanejamentoSnapShot } from '../../@core/entities/PlanejamentoSnapShot.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class PlanejamentoSnapShotRepository extends Repository<PlanejamentoSnapShot> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(PlanejamentoSnapShot, dt.createEntityManager());
  }
}
