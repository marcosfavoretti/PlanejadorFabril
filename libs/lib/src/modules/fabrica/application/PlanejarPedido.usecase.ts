import { Inject, InternalServerErrorException } from "@nestjs/common";
import { FabricaSimulacaoService } from "../infra/service/FabricaSimulacao.service";
import { FabricaService } from "../infra/service/Fabrica.service";
import { ForkFabricaService } from "../infra/service/ForkFabrica.service";
import { InputPedidosDTO } from "@libs/lib/dtos/InputPedidos.dto";
import { PedidoService } from "@libs/lib/modules/pedido/infra/service/Pedido.service";
import { IUserService } from "@libs/lib/modules/user/@core/abstract/IUserService";
import { IGerenciadorPlanejamentoMutation } from "../@core/interfaces/IGerenciadorPlanejamento";
import { Fabrica } from "../@core/entities/Fabrica.entity";
import { OnNovoPlanejamento } from "../OnNovoPlanejamento.provider";
import { IOnNovoPlanejamentos } from "../@core/interfaces/IOnNovoPlanejamento";
import { GerenciaDividaService } from "../infra/service/GerenciaDivida.service";


export class PlanejarPedidoUseCase {

    @Inject(ForkFabricaService) private forkFabricaService: ForkFabricaService;
    @Inject(FabricaSimulacaoService) private fabricaSimulacaoService: FabricaSimulacaoService;
    @Inject(GerenciaDividaService) private gerenciaDividaService: GerenciaDividaService;
    @Inject(OnNovoPlanejamento) private onNovoPlanejamento: IOnNovoPlanejamentos[];
    //deps de consulta & salvmentos
    @Inject(IGerenciadorPlanejamentoMutation) private gerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation
    @Inject(IUserService) private userService: IUserService;
    @Inject(FabricaService) private fabricaService: FabricaService;
    @Inject(PedidoService) private pedidoService: PedidoService;

    async planeje(dto: InputPedidosDTO): Promise<void> {
        try {
            const pedidos = await this.pedidoService
                .consultarPedidos(dto.pedidoIds);

            if (pedidos.some(pedido => !pedido.pedidoEhValido())) throw new Error('Um dos pedidos está faltando dependencias');

            // if(pedidos.some(ped=> ped.processado)) throw new Error('Pedido ja foi processado');

            // if (!pedidos.length || dto.pedidoIds.length !== pedidos.length || pedidos.some(p => p.processado)) throw new Error('pedido invalidos');

            const fabricaPrincipal = await this.fabricaService.consultaFabricaPrincipal();

            if (!fabricaPrincipal) throw new Error('Não foi encontrado a fabrica principal');

            const user = await this.userService.systemAuth();

            const fabricaNovaParaMudanca = await this.forkFabricaService.fork({
                user: user,
                fabrica: fabricaPrincipal,
                isPrincipal: true
            });

            let fabricaVersionada: Fabrica | undefined = undefined;

            for (const pedido of pedidos) {
                //requisao para alocacao do pedido
                const { planejamentos: planejamentosTemporarios } = await this.fabricaSimulacaoService.planejamento(fabricaPrincipal, pedido);
                //
                if (!fabricaVersionada) {
                    fabricaVersionada = await this.fabricaService.transitionSave(fabricaNovaParaMudanca);
                }
                //
                const dividas = await this.gerenciaDividaService.resolverDividas({
                    fabrica: fabricaVersionada,
                    pedido,
                    planejamentos: planejamentosTemporarios
                });
                
                await this.gerenciaDividaService.adicionaDividas(
                    fabricaVersionada,
                    dividas);
                //

                //salvamento do pedido
                const planejamentos = await this.gerenciadorPlanejamentoMutation.appendPlanejamento(fabricaVersionada, pedido, planejamentosTemporarios);

                //
                //roda eventos de pos planejamentos
                const promises = this.onNovoPlanejamento.map(on =>
                    on.execute(fabricaVersionada!, planejamentos)
                );

                await Promise.all(promises);
                //
                pedido.processaPedido();
            }
            await this.pedidoService.savePedido(pedidos);
        } catch (error) {
            console.error(error)
            throw new InternalServerErrorException(`Não foi possível consultar os pedidos ou aloca-los.\n ${error.message}`);
        }
    }

}