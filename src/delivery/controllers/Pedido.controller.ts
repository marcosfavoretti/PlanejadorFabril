import { Controller, Get, Inject, Query } from "@nestjs/common";
import { PedidoResponseDTO } from "../dtos/PedidoResponse.dto";
import { ConsultarPedidosUseCase } from "src/modules/pedido/application/ConsultarPedidos.usecase";
import { ConsultarPedidosDTO } from "../dtos/ConsultarPedidos.dto";
import { ApiResponse } from "@nestjs/swagger";

@Controller('pedido')
export class PedidoController {
    @Inject(ConsultarPedidosUseCase) private consultarPedidosUseCase: ConsultarPedidosUseCase
    @ApiResponse(
        {
            type: () => PedidoResponseDTO,
            isArray: true
        }
    )
    @Get('/')
    async consultaPedidoMethod(
        @Query() dto: ConsultarPedidosDTO
    ): Promise<PedidoResponseDTO[]> {
        return await this.consultarPedidosUseCase.consultar(dto);
    }
}