import { PedidoLogixDTO } from "apps/importa-pedido/src/@core/classes/PedidoLogix.dto";
import { PedidoLogixDAO } from "apps/importa-pedido/src/infra/service/PedidosLogix.dao";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { EmailService } from "@libs/lib/modules/shared/services/Email.service";
import { ControlFile, FileService } from "@libs/lib/modules/shared/services/JobsFile.service";
import { Inject, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { format } from "date-fns";
import { Email } from "@libs/lib/modules/shared/@core/classes/Email";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

export class ImportadorDePedidoJob implements OnModuleInit {
    private readonly logger = new Logger(ImportadorDePedidoJob.name);

    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(PedidoLogixDAO) private pedidoLogixDAO: PedidoLogixDAO,
        @Inject(EmailService) private emailService: EmailService,
        @InjectQueue('planejamento') private planejamentoQueue: Queue,
    ) { }

    onModuleInit() {
        console.log('cara')
        this.planejamentoQueue.client.ping((err, res) => {
            if (err) throw new Error(err.message)
            console.log(res)
        });
        // Observa eventos da fila
        this.planejamentoQueue.on('ready', () => {
            this.logger.log('Fila "planejamento" pronta para uso ✅');
        });
        this.planejamentoQueue.on('error', (err) => {
            this.logger.error(`Erro na fila "planejamento": ${err.message}`);
        });
        this.planejamentoQueue.on('failed', (job, err) => {
            this.logger.error(`Job ${job.id} falhou na fila: ${err.message}`);
        });
    }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async import(): Promise<void> {
        this.logger.log('Iniciando job de importação 💨');

        const falhaNoSalvar: Partial<Pedido>[] = [];
        const falhaNoPlanejar: Pedido[] = [];

        try {
            const pedidosParaProcessar = await this.obterPedidosParaProcessar();
            this.logger.log(`Encontrados ${pedidosParaProcessar.length} pedidos para processar`);

            const pedidosSalvos = await this.salvarPedidos(pedidosParaProcessar, falhaNoSalvar);
            this.logger.debug(`Salvos ${pedidosSalvos.length} pedidos`);

            await this.executarPlanejamento(pedidosSalvos, falhaNoPlanejar);
        } catch (error) {
            this.logger.error('Erro inesperado no processo de importação', error.stack);
        } finally {
            await this.enviarResumoDeFalhas(falhaNoSalvar, falhaNoPlanejar);
        }

        this.logger.log('Job finalizado 💨');
    }

    private async obterPedidosParaProcessar(): Promise<Partial<Pedido>[]> {
        const file = await FileService.readFile(ControlFile.JOBS);
        const ultimaSincronizacao = file.LASTSYNC ? new Date(file.LASTSYNC) : new Date();

        const pedidosEncontrados = await this.pedidoLogixDAO.search(ultimaSincronizacao);

        await FileService.writeFile(ControlFile.JOBS, {
            LASTIMPORT: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        });

        return pedidosEncontrados.map(PedidoLogixDTO.toDomainEntity);
    }

    private async salvarPedidos(pedidos: Partial<Pedido>[], falhaNoSalvar: Partial<Pedido>[]): Promise<Pedido[]> {
        const pedidosSalvos: Pedido[] = [];

        for (const pedido of pedidos) {
            try {
                const result = await this.pedidoService.savePedido([pedido]);
                pedidosSalvos.push(...result);
            } catch (error) {
                falhaNoSalvar.push(pedido);
                this.logger.warn(`Falha ao salvar pedido: ${pedido.id}`);
                await FileService.appendErrorTxt(`ERRO NO ITEM ${JSON.stringify(pedido, null, 2)}: ${error}`);
            }
        }

        return pedidosSalvos;
    }

    private async executarPlanejamento(pedidos: Pedido[], falhaNoPlanejar: Pedido[]): Promise<void> {
        if (!pedidos.length) return;

        this.logger.log('Iniciando etapa de planejamento 🫷');

        try {
            // 🔎 Testa conexão com Redis antes de enfileirar
            const client = await this.planejamentoQueue.client;
            await client.ping();
            this.logger.log('Conexão com Redis confirmada ✅');
        } catch (err) {
            this.logger.error('Redis indisponível, não será possível planejar', err);
            falhaNoPlanejar.push(...pedidos);
            return;
        }

        const pedidosComDependencias = await this.pedidoService.consultarPedidos(
            pedidos.map(ped => ped.id),
        );

        const pedidosValidos = pedidosComDependencias.filter(ped => ped.pedidoEhValido());

        if (!pedidosValidos.length) {
            this.logger.log('Nenhum pedido válido encontrado para planejamento');
            return;
        }

        const pedidosValidosPrioridade = pedidosValidos.sort(
            (a, b) => a.getSafeDate().getTime() - b.getSafeDate().getTime(),
        );

        for (const pedido of pedidosValidosPrioridade) {
            try {
                const job = await this.planejamentoQueue.add(
                    'planejar',
                    { pedidoId: pedido.id },
                    { removeOnComplete: true, attempts: 3, backoff: 5000, timeout: 60000 },
                );
                this.logger.log(`Pedido ${pedido.id} adicionado à fila - ${job}`);
            } catch (err) {
                this.logger.error(`Falha ao enfileirar pedido ${pedido.id}`, err);
                falhaNoPlanejar.push(pedido);
            }
        }
    }

    private async enviarResumoDeFalhas(falhaNoSalvar: Partial<Pedido>[], falhaNoPlanejar: Pedido[]): Promise<void> {
        if (!falhaNoSalvar.length && !falhaNoPlanejar.length) return;

        const email = new Email({
            attachments: [],
            html: `
                <h1>Falhas no job de importação:</h1>
                <br><br>
                <h2>Falha no planejamento</h2>
                <ul>
                    ${falhaNoPlanejar.map(p => `<li>pedidoId:${p.id} data:${format(p.getSafeDate(), 'dd/MM/yyyy')} item:${p.getItem().getCodigo()} desc:${p.getItem().getTipoItem()}</li>`).join('\n')}
                </ul>
                <h2>Falha ao importar</h2>
                <ul>
                    ${falhaNoSalvar.map((p: Pedido) => `<li>${p.getItem().getCodigo()}-${p?.getItem()?.getTipoItem()}</li>`).join('\n')}
                </ul>
            `,
            subject: 'Erro ao processar pedidos',
            to: ['marcos.junior@ethos.ind.br'],
        });

        await this.emailService.send(email);
    }
}
