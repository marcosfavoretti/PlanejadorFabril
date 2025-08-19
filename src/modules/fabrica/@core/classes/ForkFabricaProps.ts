import { User } from "src/modules/user/@core/entities/User.entity";
import { Fabrica } from "../entities/Fabrica.entity";

export class ForkFabricaProps {
    user: User;
    isPrincipal: boolean;
    fabrica: Fabrica;
}