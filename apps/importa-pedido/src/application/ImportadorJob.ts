import { ImportadorDePedidosUseCase } from "@libs/lib/modules/jobs/application/ImportadorDePedidos.usecase";
import { Inject, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

export class ImportadorJob {
    logger = new Logger();
    @Inject(ImportadorDePedidosUseCase) private importadorDePedidosUseCase: ImportadorDePedidosUseCase
    @Cron(CronExpression.EVERY_10_SECONDS)
    async import(): Promise<void> {
        await this.importadorDePedidosUseCase.executar();
    }
}