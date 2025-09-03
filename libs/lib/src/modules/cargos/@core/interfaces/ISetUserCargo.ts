import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
import { GerenciaCargo } from "../entities/GerenciaCargo.entity";
import { Cargo } from "../entities/Cargo.entity";

export interface ISetUserCargo {
    set(user: User, cargo: Cargo):Promise<GerenciaCargo>;
}