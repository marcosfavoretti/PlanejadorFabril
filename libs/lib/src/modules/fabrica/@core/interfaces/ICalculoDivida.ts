import { Divida } from "../entities/Divida.entity";


//poss arquitetar isso para injecao mais para frente
export interface ICalculoDivida {
    calc(): Promise<Partial<Divida>[]> | Partial<Divida>[];
}