import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User.entity';


export class JwtHandler {
    private secretKey: string;
    private expiresIn: string;

    constructor() {
        this.secretKey = String(process.env.SECRET);
        this.expiresIn = String(process.env.EXPIREHOURS);
    }

    checkToken(token: string): boolean {
        try {
            jwt.verify(token, this.secretKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    decodeToken(token: string): unknown {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    generateToken(user: User): string {
        const payload : Omit<User, 'password'> = {
            ...user
        }
        return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
    }
}