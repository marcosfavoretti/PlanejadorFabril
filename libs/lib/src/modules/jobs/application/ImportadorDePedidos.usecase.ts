import { Inject, Logger } from "@nestjs/common";
import { PedidoLogixDAO } from "../@infra/DAO/PedidosLogix.dao";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { ControlFile, FileService } from "@libs/lib/modules/shared/services/JobsFile.service";
import { format } from "date-fns";
import { PedidoLogixDTO } from "../@core/dto/PedidoLogix.dto";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejarPedidoUseCase } from "@libs/lib/modules/fabrica/application";

export class ImportadorDePedidosUseCase {

    logger = new Logger();
    
    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService,
        @Inject(PedidoLogixDAO) private pedidoLogixDAO: PedidoLogixDAO,
        @Inject(PlanejarPedidoUseCase) private planejarPedidoUseCase: PlanejarPedidoUseCase
    ) { }

    async executar(): Promise<void> {
        try {
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

                // paraPlanejar.length && await this.planejarPedidoUseCase.planeje({
                //     pedidoIds: paraPlanejar.map(ped => ped.id),
                // })
            }
        } catch (error) {
            throw error;
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