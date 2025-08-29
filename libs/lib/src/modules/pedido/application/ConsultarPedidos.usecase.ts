import { Inject } from "@nestjs/common";
import { ConsultarPedidosDTO, TIPO_CONSULTA } from "@dto/ConsultarPedidos.dto";
import { PedidoResponseDTO } from "@dto/PedidoResponse.dto";
import { PedidoService } from "../infra/service/Pedido.service";

export class ConsultarPedidosUseCase {
    constructor(
        @Inject(PedidoService) private pedidoService: PedidoService
    ) { }

    private readonly paramMatrix: Record<TIPO_CONSULTA, boolean | 'TODOS'> = {
        n_planejados: false,
        planejados: true,
        todos: 'TODOS'
    }

    async consultar(dto: ConsultarPedidosDTO): Promise<PedidoResponseDTO[]> {
        const result = this.paramMatrix[dto.tipoConsulta] === 'TODOS' ?
            await this.pedidoService.consultarPedidosNoPeriodo() :
            await this.pedidoService.consultaPedidosPlanejadosOuNPlanejados(
                Boolean(this.paramMatrix[dto.tipoConsulta])
            );
        return result.map(res => PedidoResponseDTO.fromEntity(res));
    }
}