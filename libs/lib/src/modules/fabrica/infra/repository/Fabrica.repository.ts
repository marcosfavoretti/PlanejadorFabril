import { DataSource, Repository } from 'typeorm';
import { Fabrica } from '../../@core/entities/Fabrica.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class FabricaRepository extends Repository<Fabrica> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(Fabrica, dt.createEntityManager());
  }
}
