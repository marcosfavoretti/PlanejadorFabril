import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity';
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity';
import { CalculaDividaDoPlanejamento } from "@libs/lib/modules/fabrica/@core/services/CalculaDividaDoPlanejamento';

describe('CalculaDividaDoPlanejamento', () => {
  const mockFabrica: Fabrica = { fabricaId: 1, checkPoint: false, principal: true } as unknown as Fabrica;
  const mockPedido: Pedido = { id: 1, lote: 100 } as Pedido;
  const mockSetorA = { codigo: 'A', nome: 'Setor A' };
  const mockSetorB = { codigo: 'B', nome: 'Setor B' };

  it('should return empty array if all setores are fully planned', () => {
    const planejamentos: Planejamento[] = [
      { setor: mockSetorA, qtd: 100 } as Planejamento,
      { setor: mockSetorB, qtd: 100 } as Planejamento,
    ];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result).toEqual([]);
  });

  it('should return divida for setor with less planned than pedido.lote', () => {
    const planejamentos: Planejamento[] = [
      { setor: mockSetorA, qtd: 80 } as Planejamento,
      { setor: mockSetorB, qtd: 100 } as Planejamento,
    ];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      fabrica: mockFabrica,
      origem: 'calculo',
      pedido: mockPedido,
      qtd: 20,
      setor: mockSetorA,
    });
  });

  it('should return dividas for multiple setores with less planned', () => {
    const planejamentos: Planejamento[] = [
      { setor: mockSetorA, qtd: 50 } as Planejamento,
      { setor: mockSetorB, qtd: 60 } as Planejamento,
    ];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ setor: mockSetorA, qtd: 50 }),
        expect.objectContaining({ setor: mockSetorB, qtd: 40 }),
      ])
    );
  });

  it('should use the provided casoFalharTag', () => {
    const planejamentos: Planejamento[] = [
      { setor: mockSetorA, qtd: 80 } as Planejamento,
    ];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'manual',
    });

    const result = service.calc();
    expect(result[0].origem).toBe('manual');
  });

  it('should handle empty planejamentos', () => {
    const planejamentos: Planejamento[] = [];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result).toEqual([]);
  });

  it('should sum qtd for same setor', () => {
    const planejamentos: Planejamento[] = [
      { setor: mockSetorA, qtd: 30 } as Planejamento,
      { setor: mockSetorA, qtd: 40 } as Planejamento,
      { setor: mockSetorA, qtd: 10 } as Planejamento,
    ];

    const service = new CalculaDividaDoPlanejamento({
      fabrica: mockFabrica,
      pedido: mockPedido,
      planejamentos,
      casoFalharTag: 'calculo',
    });

    const result = service.calc();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      setor: mockSetorA,
      qtd: 20,
    });
  });
});
