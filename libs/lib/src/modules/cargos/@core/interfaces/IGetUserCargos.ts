import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { GerenciaCargo } from "../entities/GerenciaCargo.entity";

export interface IGetUserCargos {
    get(user: User): Promise<GerenciaCargo[]>;
}