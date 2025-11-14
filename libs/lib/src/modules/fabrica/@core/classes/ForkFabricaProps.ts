import { User } from '@libs/lib/modules/user/@core/entities/User.entity';
import { Fabrica } from '../entities/Fabrica.entity';

export class ForkFabricaProps {
  user: User;
  isPrincipal: boolean;
  fabrica: Fabrica;
  /**
   * @description força a fabrica ser checkpoint
   */
  forceCheckPoint?: boolean = false;
}
