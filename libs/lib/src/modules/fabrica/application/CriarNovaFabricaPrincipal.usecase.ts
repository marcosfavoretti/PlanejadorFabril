import { Inject } from '@nestjs/common';
import { RequestFabricaForkUseCase } from './RequestFabricaForkUseCase.usecase';
import { Fabrica } from '../@core/entities/Fabrica.entity';
import { IUserService } from '@libs/lib/modules/user/@core/abstract/IUserService';

export class CriarNovaFabricaPrincipalUseCase {
  constructor(
    @Inject(IUserService) private userService: IUserService,
    @Inject(RequestFabricaForkUseCase)
    private requestFabricaForkUseCase: RequestFabricaForkUseCase,
  ) {}

  async criar(): Promise<Fabrica> {
    try {
      const user = await this.userService.systemAuth();
      return await this.requestFabricaForkUseCase.fork(
        {
          userId: user.id,
        },
        true,
      );
    } catch (error) {
      throw error;
    }
  }
}
