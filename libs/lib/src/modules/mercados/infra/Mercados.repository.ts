import { DataSource, Repository } from 'typeorm';
import { Mercado } from '../@core/entities/Mercados.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class MercadoRepository extends Repository<Mercado> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(Mercado, dt.createEntityManager());
  }
}
