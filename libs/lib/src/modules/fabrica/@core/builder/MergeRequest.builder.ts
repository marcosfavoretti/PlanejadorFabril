import { MergeRequest } from "../entities/MergeRequest.entity";
import { Fabrica } from "../entities/Fabrica.entity";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";

export class MergeRequestBuilder {
  private _fabrica: Fabrica;
  private _feitoPor: User;
  private _aceitoPor?: User;
  private _aceitaEm?: Date | null;

  fabrica(fabrica: Fabrica): this {
    this._fabrica = fabrica;
    return this;
  }

  feitoPor(user: User): this {
    this._feitoPor = user;
    return this;
  }

  aceitoPor(user: User): this {
    this._aceitoPor = user;
    return this;
  }

  aceitaEm(date: Date | null): this {
    this._aceitaEm = date;
    return this;
  }

  build(): MergeRequest {
    const mr = new MergeRequest();
    mr.fabrica = this._fabrica;
    mr.feitoPor = this._feitoPor;
    if (this._aceitoPor) mr.aceitoPor = this._aceitoPor;
    if (this._aceitaEm) mr.aceitaEm = this._aceitaEm;
    return mr;
  }
}
