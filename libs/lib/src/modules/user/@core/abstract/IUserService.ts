import { AuthDto } from "@dto/Auth.dto";
import { User } from "../entities/User.entity";

export interface IUserService {
    validUser(userdto: User):Promise<boolean>;
    auth(auth: AuthDto):Promise<User>;
    saveUser(user: User):Promise<User>;
    getUser(idUser: string):Promise<User>
    guestAutentication(name: string):Promise<User>;
    systemAuth():Promise<User>;
}
export const IUserService = Symbol('IUserService');