import { CalculaDividaDaAtualizacao } from '../../src/modules/fabrica/@core/services/CalculaDividaDaAtualizacao';
import { Planejamento } from '@libs/lib/modules/planejamento/@core/entities/Planejamento.entity';
import { Fabrica } from '../../src/modules/fabrica/@core/entities/Fabrica.entity';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';

describe('CalculaDividaDaAtualizacao', () => {
  const planejamentoOrigial: Planejamento = {
    qtd: 10,
    setor: 'Setor A',
  } as unknown as Planejamento;

  const planejamentoNovo: Planejamento = {
    qtd: 15,
    setor: 'Setor A',
  } as unknown as Planejamento;

  const fabrica: Fabrica = {
    id: 1,
    nome: 'Fabrica Teste',
  } as unknown as Fabrica;

  const pedido: Pedido = {
    id: 123,
    descricao: 'Pedido Teste',
  } as unknown as Pedido;

  it('should calculate the correct divida when qtd increases', () => {
    const service = new CalculaDividaDaAtualizacao({
      planejamentoOrigial,
      planejamentoNovo,
      fabrica,
      pedido,
      casoFalharTag: 'manual',
    });

    const result = service.calc();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fabrica,
      origem: 'manual',
      pedido,
      qtd: 5,
      setor: 'Setor A',
    });
  });

  it('should calculate the correct divida when qtd decreases', () => {
    const service = new CalculaDividaDaAtualizacao({
      planejamentoOrigial: {
        ...planejamentoOrigial,
        qtd: 20,
      } as unknown as Planejamento,
      planejamentoNovo: {
        ...planejamentoNovo,
        qtd: 10,
      } as unknown as Planejamento,
      fabrica,
      pedido,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result[0].qtd).toBe(-10);
    expect(result[0].origem).toBe('calculo');
  });

  it('should use the correct setor from planejamentoOrigial', () => {
    const service = new CalculaDividaDaAtualizacao({
      planejamentoOrigial: {
        ...planejamentoOrigial,
        setor: 'Setor B',
      } as unknown as Planejamento,
      planejamentoNovo,
      fabrica,
      pedido,
      casoFalharTag: 'falha_alocacao',
    });

    const result = service.calc();
    expect(result[0].setor).toBe('Setor B');
  });
});
