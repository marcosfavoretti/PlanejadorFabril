import { Body, Controller, Put, Get, HttpCode, HttpStatus, Inject, Post, Query, Req, UseGuards, Delete } from "@nestjs/common";
import { ApiResponse, ApiResponseProperty, ApiTags } from "@nestjs/swagger";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { ConsutlarFabricaPrincipalAtualUseCase } from "src/modules/fabrica/application/ConsultarFabricaPrincipalAtual.usecase";
import { FabricaResponseDto } from "../dtos/FabricaResponse.dto";
import { RequestFabricaForkUseCase } from "src/modules/fabrica/application/RequestFabricaForkUseCase.usecase";
import { FabricaForkDTO } from "../dtos/FabricaFork.dto";
import { JwtGuard } from "src/modules/user/@core/guard/jwt.guard";
import { ConsutlarFabricasDoUsuarioUseCase } from "src/modules/fabrica/application/ConsultarFabricasDoUsuario.usecase";
import { CustomRequest } from "src/modules/shared/@core/classes/CustomRequest";
import { ConsultarPlanejamentosUseCase } from "src/modules/fabrica/application/ConsultarPlanejamento.usecase";
import { PlanejamentoResponseDTO } from "../dtos/PlanejamentoResponse.dto";
import { ConsultaPlanejamentosDTO } from "../dtos/ConsultaPlanejamentos.dto";
import { ConsultarFabricaUseCase } from "src/modules/fabrica/application/ConsultarFabrica.usecase";
import { ConsutlarFabricaDTO } from "../dtos/ConsultarFabrica.dto";
import { AdicionarPlanejamentoManualUseCase, AtualizarPlanejamentoUseCase, PlanejarPedidoUseCase, ReplanejarPedidoUseCase } from "src/modules/fabrica/application";
import { AtualizarPlanejamentoDTO } from "../dtos/AtualizarPlanejamento.dto";
import { ResetaFabricaUseCase } from "src/modules/fabrica/application/ResetaFabrica.usecase";
import { ResetaFabricaDTO } from "../dtos/ResetaFabrica.dto";
import { PlanejarPedidoDTO } from "../dtos/PlanejarPedido.dto";
import { UserFabricaResponseDto } from "../dtos/UserFabricaResponse.dto";
import { PedidosPlanejadosResponseDTO } from "../dtos/PedidosPlanejadosResponse.dto";
import { ConsultarPedidosPlanejadosUseCase } from "src/modules/fabrica/application/ConsultarPedidosPlanejados.usecase";
import { AdicionarPlanejamentoDTO } from "../dtos/AdicionarPlanejamento.dto";
import { RemoverPlanejamentoUseCase } from "src/modules/fabrica/application/RemoverPlanejamento.usecase";
import { RemoverPlanejamentoDTO } from "../dtos/RemoverPlanejamento.dto";
import { MergeFabricaUseCase } from "src/modules/fabrica/application/MergeFabrica.usecase";
import { DonoDaFabricaGuard } from "src/modules/fabrica/@core/guard/dono-da-fabrica.guard";
import { DeletarFabricaUseCase } from "src/modules/fabrica/application/DeletarFabrica.usecase";
import { ReplanejarPedidoDTO } from "../dtos/ReplanejarPedido.dto";
import { NaPrincipalNao } from "src/modules/fabrica/@core/guard/na-princiapal-nao.guard";

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
        @Body() dto: PlanejarPedidoDTO,
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
    @UseGuards(DonoDaFabricaGuard)
    @Post('/merge')
    async mergeFabricaMethod(
        @Body() payload: ConsutlarFabricaDTO
    ): Promise<FabricaResponseDto> {
        return await this.mergeFabricaUseCase.merge(payload);
    }

    @Inject(ReplanejarPedidoUseCase) private replanejarPedidoUseCase: ReplanejarPedidoUseCase;
    @UseGuards(NaPrincipalNao)
    @Post('/fabrica/replanejamento')
    async ReplanejarPedidoUseCase(
        @Body() payload: ReplanejarPedidoDTO,
    ): Promise<void> {
        return await this.replanejarPedidoUseCase.replanejar(payload);
    }


    @Inject(DeletarFabricaUseCase) private deletarFabricaUseCase: DeletarFabricaUseCase;
    @UseGuards(DonoDaFabricaGuard)
    @Delete('/fabrica')
    async deletarFabricaMethod(
        @Body() payload: ConsutlarFabricaDTO,
        @Req() req: CustomRequest,
    ): Promise<void> {
        return await this.deletarFabricaUseCase.deleta(payload, req.user);
    }
}