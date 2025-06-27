import { Controller, HttpCode, HttpStatus, Inject, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ReplanejamentoUseCase } from "src/modules/replanejamento/application/Replanejamento.usecase";

@Controller('replanejamento')
export class ReplanejamentoController{
    @Inject(ReplanejamentoUseCase) private replanejamentoUseCase : ReplanejamentoUseCase 
    @HttpCode(HttpStatus.OK)
    @Post('/')
    async replanejamentoMethod():Promise<void>{
        return await this.replanejamentoUseCase.replanejamento();
    }
}