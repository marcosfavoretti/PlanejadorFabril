import { Controller, Get, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { ConsultarDatasPlanejadasUseCase } from "src/modules/planejamento/application/ConsultarDatasPlanejadas.usecase";
import { PlanejamentoUseCase } from "src/modules/planejamento/application/Planejamento.usecase";

@Controller('plan')
export class PlanejamentoController {
    @Inject(PlanejamentoUseCase) private planejamentoUseCase: PlanejamentoUseCase;
    @Post('/')
    async planejamentoMethod(): Promise<void> {
        return this.planejamentoUseCase.planeje();
    }

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
}