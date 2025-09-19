import { Body, Controller, Put, Get, HttpCode, HttpStatus, Inject, Post, Query, Req, UseGuards, Delete } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { ConsutlarFabricaPrincipalAtualUseCase } from "@libs/lib/modules/fabrica/application/ConsultarFabricaPrincipalAtual.usecase";
import { FabricaResponseDto } from "@dto/FabricaResponse.dto";
import { RequestFabricaForkUseCase } from "@libs/lib/modules/fabrica/application/RequestFabricaForkUseCase.usecase";
import { FabricaForkDTO } from "@dto/FabricaFork.dto";
import { JwtGuard } from "@libs/lib/modules/user/@core/guard/jwt.guard";
import { ConsutlarFabricasDoUsuarioUseCase } from "@libs/lib/modules/fabrica/application/ConsultarFabricasDoUsuario.usecase";
import { CustomRequest } from "@libs/lib/modules/shared/@core/classes/CustomRequest";
import { ConsultarPlanejamentosUseCase } from "@libs/lib/modules/fabrica/application/ConsultarPlanejamento.usecase";
import { PlanejamentoResponseDTO } from "@dto/PlanejamentoResponse.dto";
import { ConsultaPlanejamentosDTO } from "@dto/ConsultaPlanejamentos.dto";
import { ConsultarFabricaUseCase } from "@libs/lib/modules/fabrica/application/ConsultarFabrica.usecase";
import { ConsutlarFabricaDTO } from "@dto/ConsultarFabrica.dto";
import { AdicionarPlanejamentoManualUseCase, AtualizarPlanejamentoUseCase, PlanejarPedidoUseCase, ReplanejarPedidoUseCase } from "@libs/lib/modules/fabrica/application";
import { AtualizarPlanejamentoDTO } from "@dto/AtualizarPlanejamento.dto";
import { ResetaFabricaUseCase } from "@libs/lib/modules/fabrica/application/ResetaFabrica.usecase";
import { ResetaFabricaDTO } from "@dto/ResetaFabrica.dto";
import { InputPedidosDTO } from "@libs/lib/dtos/InputPedidos.dto";
import { UserFabricaResponseDto } from "@dto/UserFabricaResponse.dto";
import { PedidosPlanejadosResponseDTO } from "@dto/PedidosPlanejadosResponse.dto";
import { ConsultarPedidosPlanejadosUseCase } from "@libs/lib/modules/fabrica/application/ConsultarPedidosPlanejados.usecase";
import { AdicionarPlanejamentoDTO } from "@dto/AdicionarPlanejamento.dto";
import { RemoverPlanejamentoUseCase } from "@libs/lib/modules/fabrica/application/RemoverPlanejamento.usecase";
import { RemoverPlanejamentoDTO } from "@dto/RemoverPlanejamento.dto";
import { MergeFabricaUseCase } from "@libs/lib/modules/fabrica/application/MergeFabrica.usecase";
import { DonoDaFabricaGuard } from "@libs/lib/modules/fabrica/@core/guard/dono-da-fabrica.guard";
import { DeletarFabricaUseCase } from "@libs/lib/modules/fabrica/application/DeletarFabrica.usecase";
import { ReplanejarPedidoDTO } from "@dto/ReplanejarPedido.dto";
import { NaPrincipalNao } from "@libs/lib/modules/fabrica/@core/guard/na-princiapal-nao.guard";
import { DesplanejarPedidoUseCase } from "@libs/lib/modules/fabrica/application/DesplanejarPedido.usecase";
import { DesplanejarPedidoDto } from "@libs/lib/dtos/DesplanejarPedido.dto";
import { MergeFabricaDto } from "@dto/MergeFabrica.dto";
import { RequestFabricaMergeUseCase } from "@libs/lib/modules/fabrica/application/RequestFabricaMerge.usecase";
import { ConsultaMergeRequestUseCase } from "@libs/lib/modules/fabrica/application/ConsultaMergeRequest.usecase";
import { MergeRequestPendingDto } from "@dto/MergeRequestRes.dto";
import { RolesGuard } from "@libs/lib/modules/cargos/@core/guards/VerificaCargo.guard";
import { Roles } from "@libs/lib/modules/cargos/@core/decorator/Cargo.decorator";
import { CargoEnum } from "@libs/lib/modules/cargos/@core/enum/CARGOS.enum";

@UseGuards(
    JwtGuard
)
@ApiTags('Fabrica')
@Controller('fabrica')
export class FabricaController {
    @Inject(ConsutlarFabricaPrincipalAtualUseCase) consutlarFabricaPrincipalAtualUseCase: ConsutlarFabricaPrincipalAtualUseCase
    @Get('/principal')
    @ApiResponse({
        type: () => FabricaResponseDto
    })
    async consultaFabricaPrincipalMethod(): Promise<FabricaResponseDto> {
        return await this.consutlarFabricaPrincipalAtualUseCase.consultar();
    }

    @Inject(PlanejarPedidoUseCase) private planejamentoUseCase: PlanejarPedidoUseCase;
    @HttpCode(HttpStatus.OK)
    @Post('/planejamentos')
    async planejarPedidoMethod(
        @Body() dto: InputPedidosDTO,
        @Req() req: CustomRequest
    ): Promise<void> {
        return this.planejamentoUseCase.planeje(dto);
    }

    @Inject(ResetaFabricaUseCase) private resetaFabricaUseCase: ResetaFabricaUseCase
    @HttpCode(HttpStatus.OK)
    @UseGuards(DonoDaFabricaGuard)
    @ApiResponse({
        type: () => FabricaResponseDto
    })
    @Post('/reset')
    async resetaFabricaMethod(
        @Body() dto: ResetaFabricaDTO,
        @Req() req: CustomRequest
    ): Promise<FabricaResponseDto> {
        return await this.resetaFabricaUseCase.reseta({
            fabricaId: dto.fabricaId,
        }, req.user.id);
    }

    @Inject(AtualizarPlanejamentoUseCase) private atualizarPlanejamentoUseCase: AtualizarPlanejamentoUseCase
    @HttpCode(HttpStatus.OK)
    @UseGuards(DonoDaFabricaGuard)
    @Put('/planejamentos')
    async atualizarPlanejamentoMethod(
        @Body() payload: AtualizarPlanejamentoDTO
    ): Promise<void> {
        await this.atualizarPlanejamentoUseCase.atualizar(payload);
    }

    @Inject(RemoverPlanejamentoUseCase) private removerPlanejamentoUseCase: RemoverPlanejamentoUseCase
    @UseGuards(DonoDaFabricaGuard)
    @HttpCode(HttpStatus.OK)
    @Delete('/planejamentos')
    async removerPlanejamentoMethod(
        @Body() payload: RemoverPlanejamentoDTO,
        @Req() req: CustomRequest
    ): Promise<void> {
        await this.removerPlanejamentoUseCase.remover(payload);
    }

    @Inject(AdicionarPlanejamentoManualUseCase) private adicionarPlanejamentoManualUseCase: AdicionarPlanejamentoManualUseCase;
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        type: PlanejamentoResponseDTO
    })
    @UseGuards(DonoDaFabricaGuard)
    @Post('/planejamentos/manual')
    async planejarManualMethod(
        @Body() dto: AdicionarPlanejamentoDTO,
        @Req() req: CustomRequest
    ): Promise<PlanejamentoResponseDTO> {
        return this.adicionarPlanejamentoManualUseCase.adicionar(dto);
    }


    @Inject(RequestFabricaForkUseCase) private requestFabricaForkUseCase: RequestFabricaForkUseCase
    @Post('/fork')
    async forkFabricaMethod(
        @Body() payload: FabricaForkDTO
    ): Promise<Fabrica> {
        return await this.requestFabricaForkUseCase.fork(payload);
    }

    @Inject(ConsutlarFabricasDoUsuarioUseCase) private consutlarFabricasDoUsuarioUseCase: ConsutlarFabricasDoUsuarioUseCase
    @Get('/usuario')
    @ApiResponse({
        type: () => UserFabricaResponseDto,
        isArray: true
    })
    async consutlarFabricasDoUsuarioUseCaseMethod(
        @Req() req: CustomRequest,
    ): Promise<UserFabricaResponseDto[]> {
        return await this.consutlarFabricasDoUsuarioUseCase.consultar({ userId: req.user.id });
    }

    @Inject(ConsultarPlanejamentosUseCase) private consultarPlanejamentosUseCase: ConsultarPlanejamentosUseCase
    @UseGuards(DonoDaFabricaGuard)
    @ApiResponse({
        type: () => PlanejamentoResponseDTO,
        isArray: true
    })
    @Get('/planejamentos')
    async consultaPlanejamentosMethod(
        @Query() payload: ConsultaPlanejamentosDTO
    ): Promise<PlanejamentoResponseDTO[]> {
        return await this.consultarPlanejamentosUseCase.consultar(payload);
    }


    @Inject(ConsultarFabricaUseCase) private consultarFabricaUseCase: ConsultarFabricaUseCase
    @UseGuards(DonoDaFabricaGuard)
    @ApiResponse({
        type: () => FabricaResponseDto
    })
    @Get('/')
    async consultaFabricaMethod(
        @Query() payload: ConsutlarFabricaDTO
    ): Promise<FabricaResponseDto> {
        return await this.consultarFabricaUseCase.consultar(payload);
    }

    @Inject(ConsultarPedidosPlanejadosUseCase) private consultarPedidosPlanejadosUseCase: ConsultarPedidosPlanejadosUseCase;
    @ApiResponse({
        type: PedidosPlanejadosResponseDTO,
        isArray: true
    })
    @UseGuards(DonoDaFabricaGuard)
    @Get('/planejamentos/pedidos')
    async consultarPedidosPlanejadosMethod(
        @Query() payload: ConsutlarFabricaDTO
    ): Promise<PedidosPlanejadosResponseDTO[]> {
        return await this.consultarPedidosPlanejadosUseCase.consultar(payload);
    }


    @Inject(MergeFabricaUseCase) private mergeFabricaUseCase: MergeFabricaUseCase;
    @ApiResponse({
        type: FabricaResponseDto,
    })
    @Post('/merge')
    @Roles(CargoEnum.ADMIN, CargoEnum.PCP)
    @UseGuards(RolesGuard)
    async mergeFabricaMethod(
        @Body() payload: MergeFabricaDto,
        @Req() req: CustomRequest
    ): Promise<FabricaResponseDto> {
        return await this.mergeFabricaUseCase.merge({
            dto: payload,
            user: req.user
        });
    }

    @Inject(RequestFabricaMergeUseCase) private requestFabricaMergeUseCase: RequestFabricaMergeUseCase;
    @ApiResponse({
        type: FabricaResponseDto,
    })
    @UseGuards(DonoDaFabricaGuard, NaPrincipalNao)
    @Post('/merge/request')
    async requestFabricaMergeMethod(
        @Body() payload: ConsutlarFabricaDTO,
        @Req() req: CustomRequest
    ): Promise<void> {
        return await this.requestFabricaMergeUseCase.request({
            dto: payload,
            user: req.user
        });
    }


    @Inject(ConsultaMergeRequestUseCase) private consultaMergeRequestUseCase: ConsultaMergeRequestUseCase;
    @ApiResponse({
        type: () => MergeRequestPendingDto,
        isArray: true
    })
    @Roles(CargoEnum.ADMIN, CargoEnum.PCP)
    @UseGuards(RolesGuard)
    @Get('/merge/request')
    async getRequestsFabricaMergeMethod(): Promise<MergeRequestPendingDto[]> {
        return await this.consultaMergeRequestUseCase.consultar();
    }


    @Inject(ReplanejarPedidoUseCase) private replanejarPedidoUseCase: ReplanejarPedidoUseCase;
    @UseGuards(NaPrincipalNao)
    @Post('/fabrica/replanejamento')
    async ReplanejarPedidoUseCase(
        @Body() payload: ReplanejarPedidoDTO,
    ): Promise<void> {
        return await this.replanejarPedidoUseCase.replanejar(payload);
    }

    @Inject(DesplanejarPedidoUseCase) private desplanejarPedidoUseCase: DesplanejarPedidoUseCase;
    @UseGuards(
        //    NaPrincipalNao,
        DonoDaFabricaGuard
    )
    @Delete('/fabrica/pedido')
    async desplanejarPedidoNaFabricaMethod(
        @Body() payload: DesplanejarPedidoDto,
    ): Promise<void> {
        return await this.desplanejarPedidoUseCase.desplanejar(payload);
    }

    @Inject(DeletarFabricaUseCase) private deletarFabricaUseCase: DeletarFabricaUseCase;
    @UseGuards(DonoDaFabricaGuard, NaPrincipalNao)
    @Delete('/fabrica')
    async deletarFabricaMethod(
        @Body() payload: ConsutlarFabricaDTO,
        @Req() req: CustomRequest,
    ): Promise<void> {
        return await this.deletarFabricaUseCase.deleta(payload, req.user);
    }
}