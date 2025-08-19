import { Inject, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PedidoLogixDAO } from "../@infra/DAO/PedidosLogix.dao";
import { PedidoService } from "src/modules/pedido/infra/service/Pedido.service";
import { ControlFile, FileService } from "src/modules/shared/services/JobsFile.service";
import { format } from "date-fns";
import { PedidoLogixDTO } from "../@core/dto/PedidoLogix.dto";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { PlanejarPedidoUseCase } from "src/modules/fabrica/application";

export class ImportadorDePedidosUseCase {
    logger = new Logger();
    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(PedidoLogixDAO) private pedidoLogixDAO: PedidoLogixDAO,
        @Inject(PlanejarPedidoUseCase) private planejarPedidoUseCase: PlanejarPedidoUseCase
    ) { }

    @Cron(CronExpression.EVERY_10_SECONDS, {
        name: 'IMPORTA_PEDIDO',
    })
    async executar(): Promise<void> {
        const file = await FileService.readFile(ControlFile.JOBS);

        const ultimaSincronizacao = file.LASTSYNC ? new Date(file.LASTSYNC) : new Date();

        const pedidosEncontrados = await this.pedidoLogixDAO.search(ultimaSincronizacao);

        await FileService.writeFile(
            ControlFile.JOBS, {
            LASTIMPORT: format(new Date(), 'yyyy-MM-dd hh:mm:ss')
        });

        const pedidosParaSalvar = pedidosEncontrados.map(ped => PedidoLogixDTO.toDomainEntity(ped));

        const pedidosSalvos = await this.salvarPedidos(pedidosParaSalvar);


        if (pedidosSalvos.length) {
            this.logger.log('PLANEJAMENTO IRA SER EXECUTADO');
            const pedidosSalvosDependecias = await this.pedidoService.consultarPedidos(
                pedidosSalvos.map(ped => ped.id)
            )
            const paraPlanejar = pedidosSalvosDependecias.filter(ped => ped.pedidoEhValido());

            console.log(paraPlanejar)

            paraPlanejar.length && await this.planejarPedidoUseCase.planeje({
                pedidoIds: paraPlanejar.map(ped => ped.id),
            })
        }
    }

    private async salvarPedidos(pedidos: Partial<Pedido>[]): Promise<Pedido[]> {
        const pedidosSalvos: Pedido[] = []
        for (const pedido of pedidos) {
            await this.pedidoService.savePedido(
                [pedido]
            )
                .then(
                    pedido => {
                        console.log(pedido)
                        pedidosSalvos.push(...pedido)
                    }
                )
                .catch(
                    async (error) => {
                        await FileService.appendErrorTxt(`ERRO NO ITEM ${JSON.stringify(pedido, null, 2)}`.concat(error));
                    }
                )
        }
        return pedidosSalvos

    }

}