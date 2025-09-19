import { PlanejarPedidoUseCase } from "@libs/lib/modules/fabrica/application";
import { PedidoLogixDTO } from "apps/importa-pedido/src/@core/classes/PedidoLogix.dto";
import { PedidoLogixDAO } from "apps/importa-pedido/src/infra/service/PedidosLogix.dao";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { EmailService } from "@libs/lib/modules/shared/services/Email.service";
import { ControlFile, FileService } from "@libs/lib/modules/shared/services/JobsFile.service";
import { Inject, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { format } from "date-fns";
import { Email } from "@libs/lib/modules/shared/@core/classes/Email";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";

export class ImportadorDePedidoJob {
    private readonly logger = new Logger(ImportadorDePedidoJob.name);
    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(PedidoLogixDAO) private pedidoLogixDAO: PedidoLogixDAO,
        @Inject(EmailService) private emailService: EmailService,
        @InjectQueue('planejamento') private planejamentoQueue: Queue, // fila
    ) { }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async import(): Promise<void> {
        this.logger.log('runnin 💨')
        const falhaNoSalvar: Partial<Pedido>[] = [];
        const falhaNoPlanejar: Pedido[] = [];
        try {
            const pedidosParaProcessar = await this.obterPedidosParaProcessar();
            const pedidosSalvos = await this.salvarPedidos(pedidosParaProcessar, falhaNoSalvar);
            await this.executarPlanejamento(pedidosSalvos, falhaNoPlanejar);
        } catch (error) {
            this.logger.error('Erro no processo de importação', error);
        } finally {
            await this.enviarResumoDeFalhas(falhaNoSalvar, falhaNoPlanejar);
        }
        this.logger.log('taks complete 💨');
    }

    private async obterPedidosParaProcessar(): Promise<Partial<Pedido>[]> {
        const file = await FileService.readFile(ControlFile.JOBS);
        const ultimaSincronizacao = file.LASTSYNC ? new Date(file.LASTSYNC) : new Date();
        const pedidosEncontrados = await this.pedidoLogixDAO.search(ultimaSincronizacao);
        await FileService.writeFile(ControlFile.JOBS, {
            LASTIMPORT: format(new Date(), 'yyyy-MM-dd hh:mm:ss')
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
                await FileService.appendErrorTxt(`ERRO NO ITEM ${JSON.stringify(pedido, null, 2)}: ${error}`);
            }
        }

        return pedidosSalvos;
    }

    private async executarPlanejamento(pedidos: Pedido[], falhaNoPlanejar: Partial<Pedido>[]): Promise<void> {
        if (!pedidos.length) return;

        this.logger.log('Tentativa de planejamento 🫷');

        const pedidosComDependencias = await this.pedidoService.consultarPedidos(
            pedidos.map(ped => ped.id)
        );

        const pedidosValidos = pedidosComDependencias.filter(ped => ped.pedidoEhValido());

        if (!pedidosValidos.length) {
            this.logger.log('Nao tem pedido valido');
            return;
        };

        const pedidosValidosPrioridade = pedidosValidos.sort(
            (a, b) => a.getSafeDate().getTime() - b.getSafeDate().getTime()
        )

        console.log('vou por na fila');
        for (const pedido of pedidosValidosPrioridade) {
            await this.planejamentoQueue.add('planejar', { pedidoId: pedido.id }, { removeOnComplete: true });
        }
        this.logger.log(`adicionado na fila ${pedidos.length} pedidos`)

    }

    private async enviarResumoDeFalhas(falhaNoSalvar: Partial<Pedido>[], falhaNoPlanejar: Pedido[]): Promise<void> {
        if (!falhaNoSalvar.length && !falhaNoPlanejar.length) return;

        const email = new Email({
            attachments: [],
            html: `
                <h1>Não foi possível processar a importação dos pedidos:</h1>
                <br><br>
                -=-=-=-=-=-=-= FALHA NO PLANEJAMENTO -=-=-=-=-=-=-=
                <ul>
                ${falhaNoPlanejar.map(p => `<li>pedidoId:${p.id}    data${format(p.getSafeDate(), 'dd/MM/yyyy')}   item:${p.getItem().getCodigo()}   desc:${p?.getItem()?.getTipoItem()}</li>`).join('\n')}
                </ul>
                -=-=-=-=-=-=-= FALHA AO IMPORTAR -=-=-=-=-=-=-=
                <ul>
                ${falhaNoSalvar.map((p: Pedido) => `<li>${p.getItem().getCodigo()}-${p?.getItem()?.getTipoItem()}</li>`).join('\n')}
                </ul>
            `,
            subject: 'Erro ao processar pedidos',
            to: ['marcos.junior@ethos.ind.br']
        });

        await this.emailService.send(email);
    }
}
