import { User } from "../entities/User.entity";

export interface IAutentication{
    auth(username: string, password: string):Promise<User>;
    authWeakness(userName: string): Promise<User>
}
export const IAutentication = Symbol('IAutentication');