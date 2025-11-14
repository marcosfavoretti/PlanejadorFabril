import { Fabrica } from '../entities/Fabrica.entity';
import { User } from '@libs/lib/modules/user/@core/entities/User.entity';

export class FabricaBuilder {
  private _principal: boolean;
  private _checkPoint: boolean;
  private _userId: User;
  private _fabricaPai?: Fabrica;

  principal(value: boolean): this {
    this._principal = value;
    return this;
  }

  checkPoint(value: boolean): this {
    this._checkPoint = value;
    return this;
  }

  userId(user: User): this {
    this._userId = user;
    return this;
  }

  fabricaPai(fabrica: Fabrica): this {
    this._fabricaPai = fabrica;
    return this;
  }

  build(): Fabrica {
    const fabrica = new Fabrica();
    fabrica.principal = this._principal;
    fabrica.checkPoint = this._checkPoint;
    fabrica.user = this._userId;
    if (this._fabricaPai) fabrica.fabricaPai = this._fabricaPai;
    return fabrica;
  }
}
