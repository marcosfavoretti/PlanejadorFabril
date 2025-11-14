import {
  Controller,
  Get,
  Inject,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ParamDataVirtual } from '@libs/lib/modules/fabrica/@core/enum/ParamDataVirtual.enum';
import { ConsultarDateVirtualUseCase } from '@libs/lib/modules/fabrica/application/ConsultarDataVirutal.usecase';
import { HandleDateVirtualUseCase } from '@libs/lib/modules/fabrica/application/HandleDataVirtual.usecase';

@Controller('virtual-date')
export class VirtualDateController {
  @Inject(HandleDateVirtualUseCase)
  private handleDateVirtualUseCase: HandleDateVirtualUseCase;
  @Post('handle/:param')
  @ApiParam({
    name: 'param',
    enum: ParamDataVirtual,
    description:
      'Parâmetro para alterar a data virtual: "proxima" ou "anterior"',
  })
  @ApiOkResponse({
    description: 'Lista de datas planejadas',
    schema: {
      type: 'string',
      format: 'date-time',
    },
  })
  async handleDateMethod(
    @Param('param', new ParseEnumPipe(ParamDataVirtual))
    param: ParamDataVirtual,
  ): Promise<Date> {
    return await this.handleDateVirtualUseCase.handle(param);
  }

  @Inject(ConsultarDateVirtualUseCase)
  private consultarDateVirtualUseCase: ConsultarDateVirtualUseCase;
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'date-time',
    },
  })
  @Get('')
  async consultDateMethod(): Promise<Date> {
    return await this.consultarDateVirtualUseCase.consulta();
  }
}
