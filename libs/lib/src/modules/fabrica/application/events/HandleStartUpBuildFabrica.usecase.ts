import { Inject, OnModuleInit } from '@nestjs/common';
import { FabricaService } from '../../infra/service/Fabrica.service';
import { FabricaBuilder } from '../../@core/builder/Fabrica.builder';
import { IUserService } from '@libs/lib/modules/user/@core/abstract/IUserService';

export class HandleStartUpBuildFabricaUseCase implements OnModuleInit {
  constructor(
    @Inject(IUserService) private userService: IUserService,
    @Inject(FabricaService) private fabricaservice: FabricaService,
  ) {}
  async instanceFirtsFactoryEver(): Promise<void> {
    try {
      const userSystem = await this.userService.auth({
        password: 'admin',
        user: 'admin',
      });

      const fabricaJaCriada =
        await this.fabricaservice.consultaFabricaPrincipal();

      if (!fabricaJaCriada) {
        const novaFabrica = new FabricaBuilder()
          .checkPoint(false)
          .principal(true)
          .userId(userSystem)
          .build();
        await this.fabricaservice.saveFabrica(novaFabrica);
      }
    } catch (error) {
      throw new Error(
        `Problema ao instanciar o serviço pela primeira vez: ${error.message}`,
      );
    }
  }

  async onModuleInit() {
    // await this.instanceFirtsFactoryEver();
  }
}
