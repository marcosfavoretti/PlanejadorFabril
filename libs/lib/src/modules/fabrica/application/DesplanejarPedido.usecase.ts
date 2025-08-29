import { Inject, InternalServerErrorException } from "@nestjs/common";
import { BuscaPedidosService } from "../infra/service/BuscaPedidos.service";
import { FabricaService } from "../infra/service/Fabrica.service";
import { InputPedidosDTO } from "@libs/lib/dtos/InputPedidos.dto";
import { ConsultaPlanejamentoService } from "../infra/service/ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../@core/services/PlanejamentoOverWriteByPedido.service";
import { EfetivaPlanejamentoService } from "../infra/service/EfetivaPlanejamento.service";
import { DesplanejarPedidoDto } from "@libs/lib/dtos/DesplanejarPedido.dto";

export class DesplanejarPedidoUseCase {

    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(BuscaPedidosService) private buscarPedidos: BuscaPedidosService,
        @Inject(ConsultaPlanejamentoService) private consultaPlanejamento: ConsultaPlanejamentoService,
        @Inject(EfetivaPlanejamentoService) private removeSnapShots: EfetivaPlanejamentoService
    ) { }

    async desplanejar(dto: DesplanejarPedidoDto): Promise<void> {
        try {
            const fabrica = await this.fabricaService.consultaFabrica(dto.fabricaId);
            if (!fabrica) throw new Error('Faltando a fabrica principal');
            const pedidos = await this.buscarPedidos.pedidosNaFabrica(fabrica);
            if (!this.verificaIdsPlanejados(dto.pedidoIds, pedidos.map(ped => ped.id))) throw new Error('Ids de pedido invalidos foram inputados');
            const pedidosConvertidos = pedidos.filter(ped => dto.pedidoIds.includes(ped.id));
            const planejamentosSnapShot = await this.consultaPlanejamento.consultaPorPedido(fabrica, pedidosConvertidos, new PlanejamentoOverWriteByPedidoService());
            await this.removeSnapShots.remove(fabrica, ...planejamentosSnapShot);
        } 
        catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        }
    }

    private verificaIdsPlanejados(idsInput: number[], idsBanco: number[]): boolean {
        const response = idsInput.every(inputPedido => idsBanco.includes(inputPedido));
        console.log(response);
        return response;
    }
}