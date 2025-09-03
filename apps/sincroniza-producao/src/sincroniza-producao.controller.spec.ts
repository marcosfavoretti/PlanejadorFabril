import { Test, TestingModule } from '@nestjs/testing';
import { SincronizaProducaoController } from './sincroniza-producao.controller';
import { SincronizaProducaoService } from './sincroniza-producao.service';

describe('SincronizaProducaoController', () => {
  let sincronizaProducaoController: SincronizaProducaoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SincronizaProducaoController],
      providers: [SincronizaProducaoService],
    }).compile();

    sincronizaProducaoController = app.get<SincronizaProducaoController>(SincronizaProducaoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(sincronizaProducaoController.getHello()).toBe('Hello World!');
    });
  });
});
