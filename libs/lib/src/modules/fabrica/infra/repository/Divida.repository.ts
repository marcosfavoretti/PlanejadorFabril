import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Divida } from '../../@core/entities/Divida.entity';

export class DividaRepository extends Repository<Divida> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(Divida, dt.createEntityManager());
  }
}
