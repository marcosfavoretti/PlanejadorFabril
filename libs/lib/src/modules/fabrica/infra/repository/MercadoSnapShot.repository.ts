import { DataSource, Repository } from 'typeorm';
import { MercadoSnapShot } from '../../@core/entities/MercadoSnapShot.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class MercadoSnapShotRepository extends Repository<MercadoSnapShot> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(MercadoSnapShot, dt.createEntityManager());
  }
}
