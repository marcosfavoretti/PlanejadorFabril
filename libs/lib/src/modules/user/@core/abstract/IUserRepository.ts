import { Repository } from "typeorm";
import { User } from "../entities/User.entity";

export interface IUserRepository extends Repository<User>{}