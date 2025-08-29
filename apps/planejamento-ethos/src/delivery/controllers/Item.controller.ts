import { Body, Controller, Get, Inject, Post } from "@nestjs/common";
import { ConsultarTabelaCapabilidadeDTO } from "@dto/ConsultarTabelaCapabilidade.dto";
import { ConsultarItemCapabilidadeTabelaUseCase } from "@libs/lib/modules/item/application/ConsultarItemCapabilidadeTabela.usecase";
import { ApiResponse } from "@nestjs/swagger";
import { CadastrarItemCapabilidadeUseCase } from "@libs/lib/modules/item/application/CadastrarCapabilidade.usecase";

@Controller('item')
export class ItemController {
    @Inject(ConsultarItemCapabilidadeTabelaUseCase) private consultarItemCapabilidadeTabelaUseCase: ConsultarItemCapabilidadeTabelaUseCase
    @ApiResponse({
        type: () => ConsultarTabelaCapabilidadeDTO,
        isArray: true
    })
    @Get('capabiliade')
    async getItemCapabilildadeMethod(): Promise<ConsultarTabelaCapabilidadeDTO[]> {
        return await this.consultarItemCapabilidadeTabelaUseCase.consultar();
    }

    @Inject(CadastrarItemCapabilidadeUseCase) private cadastrarItemCapabilidadeUseCase: CadastrarItemCapabilidadeUseCase
    @Post('/capabilidade')
    async cadastrarItemCapabilidadeMethod(@Body() payload: ConsultarTabelaCapabilidadeDTO):Promise<void>{
        return await this.cadastrarItemCapabilidadeUseCase.cadastrar(payload);
    }


}