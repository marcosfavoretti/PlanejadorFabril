import {  Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConsultarGraficoGanttUseCase } from "@libs/lib/modules/kpi/application/ConsultarGraficoGantt.usecase";
import { GetGanttInformationDto } from "@dto/GetGanttInformation.dto";
import { ConsultarGanttDTO } from "@dto/ConsultarGantt.dto";
import { JwtGuard } from "@libs/lib/modules/shared/@core/guard/jwt.guard";

@UseGuards(JwtGuard)
@Controller('kpi')
export class KPIController {
    @Inject(ConsultarGraficoGanttUseCase) private consultarGraficoGanttUseCase: ConsultarGraficoGanttUseCase;
    @Get('/gannt')
    @ApiOperation({ summary: 'Gera informações para o gráfico' })
    @ApiResponse({
        status: 200,
        description: 'Tabela de produção gerada com sucesso',
        type: () => GetGanttInformationDto,
    })
    async getGanttInformationMethod(
        @Query() dto: ConsultarGanttDTO
    ): Promise<GetGanttInformationDto> {
        return await this.consultarGraficoGanttUseCase.consultar(dto);
    }

}