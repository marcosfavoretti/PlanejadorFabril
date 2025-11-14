import { Controller, Get } from '@nestjs/common';
import { SincronizaProducaoService } from './sincroniza-producao.service';

@Controller()
export class SincronizaProducaoController {
  constructor(
    private readonly sincronizaProducaoService: SincronizaProducaoService,
  ) {}

  @Get()
  getHello(): string {
    return this.sincronizaProducaoService.getHello();
  }
}
