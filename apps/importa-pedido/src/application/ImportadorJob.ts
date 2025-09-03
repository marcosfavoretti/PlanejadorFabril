import { PlanejarPedidoUseCase } from "@libs/lib/modules/fabrica/application";
import { PedidoLogixDTO } from "apps/importa-pedido/src/@core/classes/PedidoLogix.dto";
import { PedidoLogixDAO } from "apps/importa-pedido/src/infra/service/PedidosLogix.dao";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { EmailService } from "@libs/lib/modules/shared/services/Email.service";
import { ControlFile, FileService } from "@libs/lib/modules/shared/services/JobsFile.service";
import { Inject, InternalServerErrorException, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { format } from "date-fns";
import { Email } from "@libs/lib/modules/shared/@core/classes/Email";
import { FalhaNoPlanejarException } from "../@core/exceptions/FalhaNoPlanejar.exception";

export class ImportadorDePedidoJob {
    private readonly logger = new Logger(ImportadorDePedidoJob.name);

    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(PedidoLogixDAO) private pedidoLogixDAO: PedidoLogixDAO,
        @Inject(EmailService) private emailService: EmailService,
        @Inject(PlanejarPedidoUseCase) private planejarPedidoUseCase: PlanejarPedidoUseCase
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS)
    async import(): Promise<void> {
        const falhaNoSalvar: Partial<Pedido>[] = [];
        const falhaNoPlanejar: Partial<Pedido>[] = [];

        try {
            const pedidosParaProcessar = await this.obterPedidosParaProcessar();

            const pedidosSalvos = await this.salvarPedidos(pedidosParaProcessar, falhaNoSalvar);

            await this.executarPlanejamento(pedidosSalvos, falhaNoPlanejar);

        } catch (error) {
            this.logger.error('Erro no processo de importação', error);
        } finally {
            await this.enviarResumoDeFalhas(falhaNoSalvar, falhaNoPlanejar);
        }
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

        this.logger.log('Iniciando planejamento dos pedidos salvos');

        const pedidosComDependencias = await this.pedidoService.consultarPedidos(
            pedidos.map(ped => ped.id)
        );

        const pedidosValidos = pedidosComDependencias.filter(ped => ped.pedidoEhValido());

        if (!pedidosValidos.length) return;

        try {
            await this.planejarPedidoUseCase.planeje({ pedidoIds: pedidosValidos.map(ped => ped.id) });
        } catch (error) {
            falhaNoPlanejar.push(...pedidosValidos);
            if (error instanceof InternalServerErrorException) {
                throw new FalhaNoPlanejarException(pedidosValidos);
            }
        }
    }

    private async enviarResumoDeFalhas(falhaNoSalvar: Partial<Pedido>[], falhaNoPlanejar: Partial<Pedido>[]): Promise<void> {
        if (!falhaNoSalvar.length && !falhaNoPlanejar.length) return;

        const email = new Email({
            attachments: [],
            html: `
                Não foi possível processar a importação dos pedidos:

                -=-=-=-=-=-=-= FALHA NO PLANEJAMENTO -=-=-=-=-=-=-=
                ${falhaNoPlanejar.map(p => JSON.stringify(p)).join(',\n')}

                -=-=-=-=-=-=-= FALHA AO IMPORTAR -=-=-=-=-=-=-=
                ${falhaNoSalvar.map(p => JSON.stringify(p)).join(',\n')}
            `,
            subject: 'Erro ao processar pedidos',
            to: ['marcos.junior@ethos.ind.br']
        });

        await this.emailService.send(email);
    }
}
