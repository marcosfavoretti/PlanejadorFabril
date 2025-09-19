import { CalendarioLogix } from "../classes/CalendarioLogix";


export const IBuscaCalendario = Symbol('IBuscaCalendario')

export interface IBuscaCalendario {
    busca(): Promise<CalendarioLogix[]>;
}