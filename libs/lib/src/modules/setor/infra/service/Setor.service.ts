import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { Setor } from '../../@core/entities/Setor.entity';
import { SetorRepository } from '../repository/Setor.repository';
import { Inject } from '@nestjs/common';

export class SetorService {
  constructor(
    @Inject(SetorRepository) private setorRepository: SetorRepository,
  ) {}

  async consultarSetores(): Promise<Setor[]> {
    return await this.setorRepository.find();
  }

  async consultarSetor(codigo: CODIGOSETOR): Promise<Setor> {
    return await this.setorRepository.findOneOrFail({
      where: {
        codigo: codigo,
      },
    });
  }
}
