import { Body, Controller, Get, HttpStatus, Inject, Post, Query } from "@nestjs/common";
import { ConsultaTabelaDiariaUseCase } from "src/modules/producao-simulacao/application/ConsultaTabelaDiaria.usecase";
import { ApiQuery, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GetTabelaProducaoDiarioDTO } from "../dtos/GetTabelaProducaoDiario.dto";
import { SaveTabelaDiarioUseCase } from "src/modules/producao-simulacao/application/SaveTabelaDiario.usecase";
import { SalvarTabelaProducaoDiarioDTO } from "../dtos/SalvarTabelaProucaoDiario.dto";
import { GetGanttInformationDto } from "../dtos/GetGanttInformation.dto";
import { ConsultarMercadoUseCase } from "src/modules/kpi/application/ConsultarMercado.usecase";
import { ConsultarGraficoGanttUseCase } from "src/modules/kpi/application/ConsultarGraficoGantt.usecase";
import { GetMercadosEntreSetoresTabelaDto } from "../dtos/GetMercadosEntreSetores.dto";

@Controller('simulacao')
export class ProducaoSimulacaoController {
    @Inject(ConsultaTabelaDiariaUseCase) private generateTabela: ConsultaTabelaDiariaUseCase;
    @Get('/gen')
    @ApiOperation({ summary: 'Gera a tabela diária de produção para a data informada' })
    @ApiQuery({ name: 'startDate', required: true, description: 'inicio no dia' })
    @ApiQuery({ name: 'endDate', required: true, description: 'finalizacao no dia' })
    @ApiResponse({ status: 200, description: 'Tabela de produção gerada com sucesso', type: () => GetTabelaProducaoDiarioDTO, isArray: true })
    async genTabelaDiariaMethod(@Query('startDate') start: string, @Query('endDate') end: string): Promise<GetTabelaProducaoDiarioDTO[]> {
        return await this.generateTabela.generate({
            startDate: start, endDate: end
        });
    }

    @Inject(ConsultarMercadoUseCase) private consultarMercadoUseCase: ConsultarMercadoUseCase
    @ApiResponse({
        isArray: true,
        type: () => GetMercadosEntreSetoresTabelaDto
    })
    @Get('gen/mercado')
    async consultarMercadoMethod(): Promise<GetMercadosEntreSetoresTabelaDto[]> {
        return this.consultarMercadoUseCase.consultar()
    }

    @Inject(ConsultarGraficoGanttUseCase) private consultarGraficoGanttUseCase: ConsultarGraficoGanttUseCase;
    @Get('/gen/gannt')
    @ApiOperation({ summary: 'Gera informações para o gráfico' })
    @ApiResponse({ status: 200, description: 'Tabela de produção gerada com sucesso', type: () => GetGanttInformationDto, isArray: true })
    async getGanttInformationMethod(): Promise<GetGanttInformationDto[]> {
        return await this.consultarGraficoGanttUseCase.consultar();
    }

    @Inject(SaveTabelaDiarioUseCase) private saveTabela: SaveTabelaDiarioUseCase;
    @Post('/gen')
    @ApiOperation({ summary: 'Salva a tabela diária de produção para a data informada' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Salvar tabela', type: undefined })
    async saveTabelaDiariaMethod(@Body() dto: SalvarTabelaProducaoDiarioDTO): Promise<void> {
        return await this.saveTabela.salvar(dto);
    }
}