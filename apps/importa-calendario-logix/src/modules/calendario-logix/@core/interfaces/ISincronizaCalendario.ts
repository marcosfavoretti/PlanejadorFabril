import { CalendarioLogix } from "../classes/CalendarioLogix";

export const ISincronizaCalendario = Symbol('ISincronizaCalendario')

export interface ISincronizaCalendario {
    sincroniza(calendario: CalendarioLogix): Promise<void>;
}