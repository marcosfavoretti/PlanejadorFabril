import { Inject } from '@nestjs/common';
import { DeleteResult, In } from 'typeorm';
import { PlanejamentoSnapShotRepository } from '../repository/PlanejamentoSnapShot.repository';
import { PlanejamentoSnapShot } from '../../@core/entities/PlanejamentoSnapShot.entity';
import { DividaSnapShotRepository } from '../repository/DividaSnapShot.repository';
import { Fabrica } from '../../@core/entities/Fabrica.entity';

export class DeletaSnapShotService {
  constructor(
    @Inject(DividaSnapShotRepository)
    private dividaSnapShotRepository: DividaSnapShotRepository,
    @Inject(PlanejamentoSnapShotRepository)
    private planejamentoSnapShotRepository: PlanejamentoSnapShotRepository,
  ) {}

  async deletePlanejamentosSnapShot(fabrica: Fabrica): Promise<DeleteResult[]> {
    try {
      return await Promise.all([
        this.planejamentoSnapShotRepository.delete({
          fabrica: { fabricaId: fabrica.fabricaId },
        }),
        this.dividaSnapShotRepository.delete({
          fabrica: { fabricaId: fabrica.fabricaId },
        }),
      ]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
