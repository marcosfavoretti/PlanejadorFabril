import { SetorService } from 'src/modules/planejamento/@core/abstract/SetorService';
import { MetodoDeAlocacao } from 'src/modules/planejamento/@core/abstract/MetodoDeAlocacao';
import { CODIGOSETOR } from 'src/modules/planejamento/@core/enum/CodigoSetor.enum';
import { SetorChainFactoryService } from 'src/modules/fabrica/@core/services/SetorChainFactory.service';

describe('SetorChainFactoryService', () => {
  let service: SetorChainFactoryService;
  let mockPipeProducao: jest.Mocked<SetorService>;
  let mockMetodoDeAlocacao: jest.Mocked<MetodoDeAlocacao>;
  let mockMetodoDeAlocacao2: jest.Mocked<MetodoDeAlocacao>;

  beforeEach(() => {
    // mock do SetorService
    mockPipeProducao = {
      getSetorInChain: jest.fn(),
      getSetoresInChain: jest.fn(),
      setMetodoDeAlocacao: jest.fn(),
      setNextSetor: jest.fn(),
      getSetorCode: jest.fn(),
    } as unknown as jest.Mocked<SetorService>;

    // mock do MetodoDeAlocacao
    mockMetodoDeAlocacao = {} as jest.Mocked<MetodoDeAlocacao>;
    mockMetodoDeAlocacao2 = {} as jest.Mocked<MetodoDeAlocacao>;

    // cria a instância do service
    service = new SetorChainFactoryService();
    (service as any).pipeProducao = mockPipeProducao;
  });

  it('deve retornar o setor correto em getSetor', () => {
    const setorEsperado = {} as SetorService;
    mockPipeProducao.getSetorInChain.mockReturnValue(setorEsperado);

    const result = service.getSetor(CODIGOSETOR.MONTAGEM);
    expect(result).toBe(setorEsperado);
    expect(mockPipeProducao.getSetorInChain).toHaveBeenCalledWith(CODIGOSETOR.MONTAGEM);
  });

  it('deve retornar o primeiro setor em getFirstSetor', () => {
    const result = service.getFirstSetor();
    expect(result).toBe(mockPipeProducao);
  });

  it('deve chamar setMetodoDeAlocacao em todos os setores', () => {
    const setoresMockados = [
      { setMetodoDeAlocacao: jest.fn() },
      { setMetodoDeAlocacao: jest.fn() },
    ] as unknown as SetorService[];

    mockPipeProducao.getSetoresInChain.mockReturnValue(setoresMockados);

    const result = service.setMetodoDeAlocacaoCustomTodos(
      mockPipeProducao,
      [CODIGOSETOR.MONTAGEM, CODIGOSETOR.LIXA],
      mockMetodoDeAlocacao2,
    );

    setoresMockados.forEach(s => {
      expect(s.setMetodoDeAlocacao).toHaveBeenCalledWith(mockMetodoDeAlocacao2);
    });

    expect(result).toBe(mockPipeProducao);
  });

  it('deve reencadear setores corretamente em modificarCorrente', () => {
    const setor1 = {
      setNextSetor: jest.fn(),
      getSetorCode: jest.fn().mockReturnValue('SETOR1'),
    } as unknown as SetorService;

    const setor2 = {
      setNextSetor: jest.fn(),
      getSetorCode: jest.fn().mockReturnValue('SETOR2'),
    } as unknown as SetorService;

    mockPipeProducao.getSetoresInChain.mockReturnValue([setor1, setor2]);

    const result = service.modificarCorrente([CODIGOSETOR.MONTAGEM, CODIGOSETOR.LIXA]);

    expect(setor1.setNextSetor).toHaveBeenCalledWith(setor2);
    expect(setor2.setNextSetor).not.toHaveBeenCalled();
    expect(result).toBe(setor1);
  });
});
