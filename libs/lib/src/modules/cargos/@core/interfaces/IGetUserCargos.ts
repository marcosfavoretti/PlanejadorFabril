import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { GerenciaCargo } from "../entities/GerenciaCargo.entity";
export const IGetUserCargos = Symbol('IGetUserCargos');
export interface IGetUserCargos {
    getUserCargos(user: User): Promise<GerenciaCargo[]>;
}