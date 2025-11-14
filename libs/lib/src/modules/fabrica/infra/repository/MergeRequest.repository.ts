import { DataSource, Repository } from 'typeorm';
import { MergeRequest } from '../../@core/entities/MergeRequest.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class MergeRequestRepository extends Repository<MergeRequest> {
  constructor(@InjectDataSource() dt: DataSource) {
    super(MergeRequest, dt.createEntityManager());
  }
}
