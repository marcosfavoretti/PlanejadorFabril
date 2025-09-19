import { Cron, CronExpression } from "@nestjs/schedule";
import { IBuscaCalendario } from "../@core/interfaces/IBuscaCalendario";
import { ISincronizaCalendario } from "../@core/interfaces/ISincronizaCalendario";

export class SincronizarCalendarioUseCase {
    constructor(
        private buscaCalendario: IBuscaCalendario,
        private sincronizaCalendario: ISincronizaCalendario
    ) { }

    @Cron(CronExpression.EVERY_HOUR)
    async executa(): Promise<void> {
        try {
            const calendario = await this.buscaCalendario.busca();
            await this.sincronizaCalendario.sincroniza(calendario);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}