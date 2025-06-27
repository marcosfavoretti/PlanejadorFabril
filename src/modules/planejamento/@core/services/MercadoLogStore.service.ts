import { Injectable, Scope } from "@nestjs/common";
import { Mercado } from "../classes/Mercado";

@Injectable({
    scope: Scope.DEFAULT
})
export class MercadoLogStoreService {
    private logs: Map<Date, Mercado[]> = new Map();
    
    register(dia: Date, ...mercado: Mercado[]): void {
        const copies = mercado.map(m => m.copy());

        if (this.logs.has(dia)) {
            this.logs.get(dia)?.push(...copies);
        } else {
            this.logs.set(dia, [...copies]); // cria um novo array com os elementos
        }
    }

    find(): Map<Date, Mercado[]> {
        return this.logs;
    }
}