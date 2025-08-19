import { Request } from "express";
import { User } from "src/modules/user/@core/entities/User.entity";
export interface CustomRequest extends Request {
    user: User;
}