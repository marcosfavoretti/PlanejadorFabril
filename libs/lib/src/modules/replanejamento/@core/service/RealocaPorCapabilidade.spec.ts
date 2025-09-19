import { RealocaPorCapabilidade } from './RealocaPorCapabilidade';
import { RealocacaoComDepedenciaProps } from '../abstract/MetodoDeReAlocacao';
import { PlanejamentoTemporario } from '@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario';
import { RealocacaoParcial } from '@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';

describe('RealocaPorCapabilidade.realocacaoComDepedencia', () => {
    let instance: RealocaPorCapabilidade;
    let mockGerenciadorPlan: any;
    let mockSelecionarItem: any;

    beforeEach(() => {
        mockGerenciadorPlan = {
            diaParaAdiarProducaoEncaixe: jest.fn(),
            possoAlocarQuantoNoDia: jest.fn(),
        };
        mockSelecionarItem = {};
        instance = new RealocaPorCapabilidade(mockGerenciadorPlan, mockSelecionarItem);
        jest.spyOn(instance as any, 'quantoChegaDoUltimoSetorNaData').mockImplementation(() => 10);
        jest.spyOn(instance as any, 'planejamentosDoSetor').mockImplementation((planDoPedido, dataEstopim, setor) => planDoPedido);
    });

    it('should return a RealocacaoParcial with correct adicionado and retirado', async () => {
        const planejamento1: PlanejamentoTemporario = {
            dia: new Date('2024-06-01'),
            item: {},
            pedido: { item: { capabilidade: () => 5 }, lote: 10 },
            qtd: 5,
            setor: CODIGOSETOR.CORTE,
        };
        const planejamento2: PlanejamentoTemporario = {
            dia: new Date('2024-06-02'),
            item: {},
            pedido: { item: { capabilidade: () => 5 }, lote: 10 },
            qtd: 5,
            setor: CODIGOSETOR.CORTE,
        };

        mockGerenciadorPlan.diaParaAdiarProducaoEncaixe.mockResolvedValue([new Date('2024-06-03')]);
        mockGerenciadorPlan.possoAlocarQuantoNoDia.mockResolvedValue(5);

        const props: RealocacaoComDepedenciaProps = {
            planFalho: planejamento1,
            planDoPedido: [planejamento1, planejamento2],
            setor: CODIGOSETOR.CORTE,
            realocacaoUltSetor: {
                adicionado: [{ ...planejamento1, setor: CODIGOSETOR.MONTAGEM }],
                retirado: [],
            },
            fabrica: {},
            pedido: { item: { capabilidade: () => 5 }, lote: 10 },
            itemContext: {},
        };

        const result = await instance['realocacaoComDepedencia'](props);

        expect(result).toBeInstanceOf(RealocacaoParcial);
        expect(result.retirado.length).toBeGreaterThan(0);
        expect(result.adicionado.length).toBeGreaterThan(0);
        expect(result.adicionado[0]).toHaveProperty('dia');
        expect(result.adicionado[0]).toHaveProperty('qtd');
        expect(result.adicionado[0]).toHaveProperty('setor', CODIGOSETOR.CORTE);
    });

    it('should not add adicionado if qtdParaAlocar is zero', async () => {
        mockGerenciadorPlan.diaParaAdiarProducaoEncaixe.mockResolvedValue([new Date('2024-06-03')]);
        mockGerenciadorPlan.possoAlocarQuantoNoDia.mockResolvedValue(0);

        const planejamento: PlanejamentoTemporario = {
            dia: new Date('2024-06-01'),
            item: {},
            pedido: { item: { capabilidade: () => 5 }, lote: 10 },
            qtd: 5,
            setor: CODIGOSETOR.CORTE,
        };

        const props: RealocacaoComDepedenciaProps = {
            planFalho: planejamento,
            planDoPedido: [planejamento],
            setor: CODIGOSETOR.CORTE,
            realocacaoUltSetor: {
                adicionado: [{ ...planejamento, setor: CODIGOSETOR.MONTAGEM }],
                retirado: [],
            },
            fabrica: {},
            pedido: { item: { capabilidade: () => 5 }, lote: 10 },
            itemContext: {},
        };

        const result = await instance['realocacaoComDepedencia'](props);

        expect(result.adicionado.length).toBe(0);
        expect(result.retirado.length).toBeGreaterThan(0);
    });

    it('should break early if restante reaches zero', async () => {
        mockGerenciadorPlan.diaParaAdiarProducaoEncaixe.mockResolvedValue([new Date('2024-06-03')]);
        mockGerenciadorPlan.possoAlocarQuantoNoDia.mockResolvedValue(10);

        const planejamento: PlanejamentoTemporario = {
            dia: new Date('2024-06-01'),
            item: {},
            pedido: { item: { capabilidade: () => 10 }, lote: 10 },
            qtd: 10,
            setor: CODIGOSETOR.CORTE,
        };

        const props: RealocacaoComDepedenciaProps = {
            planFalho: planejamento,
            planDoPedido: [planejamento],
            setor: CODIGOSETOR.CORTE,
            realocacaoUltSetor: {
                adicionado: [{ ...planejamento, setor: CODIGOSETOR.MONTAGEM }],
                retirado: [],
            },
            fabrica: {},
            pedido: { item: { capabilidade: () => 10 }, lote: 10 },
            itemContext: {},
        };

        const result = await instance['realocacaoComDepedencia'](props);

        expect(result.adicionado.length).toBe(1);
        expect(result.adicionado[0].qtd).toBe(10);
    });
});