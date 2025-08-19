import { Body, Controller, Get, Inject, Post, Query } from "@nestjs/common";
import { ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { ConsultarDatasPlanejadasUseCase } from "src/modules/fabrica/application/ConsultarDatasPlanejadas.usecase";
import { ConsultartPedidoUseCase } from "src/modules/fabrica/application/ConsultarPedido.usecase";
import { PlanejarPedidoDTO } from "../dtos/PlanejarPedido.dto";

@Controller('plan')
export class PlanejamentoController {
    

    @Inject(ConsultarDatasPlanejadasUseCase) private consultarDatasPlanejadasUseCase: ConsultarDatasPlanejadasUseCase
    @Get('datas')
    @ApiOkResponse({
        description: 'Lista de datas planejadas',
        schema: {
            type: 'array',
            items: {
                type: 'string',
                format: 'date-time',
            },
        },
    })
    async datasPlanejadasMethod(): Promise<Date[]> {
        return await this.consultarDatasPlanejadasUseCase.consultar();
    }

   
    @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
    async consultarPedido(
        @Query('pedidoId') pedidoId: number,
        @Query('fabricaId') fabricaId: string,
    ): Promise<any> {
        // return this.consultaPedidoUsecase.consultar({ pedidoId, fabricaId });
    }
}