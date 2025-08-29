import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ForkFabricaService } from "../infra/service/ForkFabrica.service";
import { InputPedidosDTO } from "@libs/lib/dtos/InputPedidos.dto";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";


export class PlanejarPedidoUseCase {

    @Inject(IUserService) private userService: IUserService;
    @Inject(ForkFabricaService) private forkFabricaService: ForkFabricaService;
    @Inject(FabricaService) private fabricaService: FabricaService;
    @Inject(FabricaSimulacaoService) private fabricaSimulacaoService: FabricaSimulacaoService;
    @Inject(PedidoService) private pedidoService: PedidoService;

    async planeje(dto: InputPedidosDTO): Promise<void> {
        try {
            const pedidos = await this.pedidoService
                .consultarPedidos(dto.pedidoIds);

            if (pedidos.some(pedido => !pedido.pedidoEhValido())) throw new Error('Um dos pedidos está faltando dependencias');

            // if(pedidos.some(ped=> ped.processado)) throw new Error('Pedido ja foi processado');

            // if (!pedidos.length || dto.pedidoIds.length !== pedidos.length || pedidos.some(p => p.processado)) throw new Error('pedido invalidos');

            const fabricaAlvo = await this.fabricaService.consultaFabricaPrincipal();

            if (!fabricaAlvo) throw new Error('Não foi encontrado a fabrica principal');

            const user = await this.userService.systemAuth();

            const fabricaNovaParaMudanca = await this.forkFabricaService.fork({
                user: user,
                fabrica: fabricaAlvo,
                isPrincipal: true
            });

            const fabricaNovaSalva = await this.fabricaService.saveFabrica(fabricaNovaParaMudanca);

            const { planejamentos, divida } = await this.fabricaSimulacaoService.planejamento(fabricaNovaSalva, pedidos);

            //salvamento do pedido//

            //criacao da tabela de itens producao//

            //calculo de dividas//
            
            
            pedidos.map(pedido => pedido.processaPedido());

            await this.pedidoService.savePedido(pedidos);
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException(`Não foi possível consultar os pedidos ou aloca-los.\n ${error.message}`);
        }
    }

}