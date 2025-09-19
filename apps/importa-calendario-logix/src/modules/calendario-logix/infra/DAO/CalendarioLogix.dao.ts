import { DataSource } from "typeorm";
import { IBuscaCalendario } from "../../@core/interfaces/IBuscaCalendario";
import { InjectDataSource } from "@nestjs/typeorm";
import { CalendarioLogix } from "../../@core/classes/CalendarioLogix";
import { ISincronizaCalendario } from "../../@core/interfaces/ISincronizaCalendario";

export class CalendarioLogixDao
    implements IBuscaCalendario,
    ISincronizaCalendario {

    constructor(@InjectDataSource("SYNECO_DB") private dt: DataSource) { }

    async busca(): Promise<CalendarioLogix[]> {
        const response = await this.dt.query<CalendarioLogix[]>(`
            query para pegar dados do calendario com openquery
        `);
        return response;
    }

    async sincroniza(calendario: CalendarioLogix): Promise<void> {
        return;
    }
}       