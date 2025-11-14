import { Controller, Get, Inject, Query } from '@nestjs/common';
import { PedidoResponseDTO } from '@dto//PedidoResponse.dto';
import { ConsultarPedidosUseCase } from '@libs/lib/modules/pedido/application/ConsultarPedidos.usecase';
import { ConsultarPedidosDTO } from '@dto/ConsultarPedidos.dto';
import { ApiResponse } from '@nestjs/swagger';
import { ConsultaItensDoPedidoUseCase } from '@libs/lib/modules/pedido/application/ConsultaItensDoPedido.usecase';
import { ItemResDto } from '@dto/ItemRes.dto';
import { ConsultartPorPedidoDto } from '@dto/ConsultarPedido.dto';

@Controller('pedido')
export class PedidoController {
  @Inject(ConsultarPedidosUseCase)
  private consultarPedidosUseCase: ConsultarPedidosUseCase;
  @ApiResponse({
    type: () => PedidoResponseDTO,
    isArray: true,
  })
  @Get('/')
  async consultaPedidoMethod(
    @Query() dto: ConsultarPedidosDTO,
  ): Promise<PedidoResponseDTO[]> {
    return await this.consultarPedidosUseCase.consultar(dto);
  }

  @Inject(ConsultaItensDoPedidoUseCase)
  private consultaItensDoPedidoUseCase: ConsultaItensDoPedidoUseCase;
  @ApiResponse({
    type: () => ItemResDto,
    isArray: true,
  })
  @Get('/itens')
  async consultaItensDoPedidoMethod(
    @Query() dto: ConsultartPorPedidoDto,
  ): Promise<ItemResDto[]> {
    return await this.consultaItensDoPedidoUseCase.consulta(dto);
  }
}
