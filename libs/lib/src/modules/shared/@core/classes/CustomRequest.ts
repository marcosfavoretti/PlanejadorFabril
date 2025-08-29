import { Request } from "express";
import { User } from "@libs/lib/modules/user/@core/entities/User.entity";
export interface CustomRequest extends Request {
    user: User;
}