import { Mercado } from "src/modules/planejamento/@core/classes/Mercado";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { MercadoLogStoreService } from "src/modules/planejamento/@core/services/MercadoLogStore.service";

// Mock da classe Calendario
jest.mock('src/modules/shared/@core/classes/Calendario', () => {
    return {
        Calendario: jest.fn().mockImplementation(() => ({
            format: (date: Date) => date.toISOString().split('T')[0]  // yyyy-MM-dd
        }))
    };
});

describe('MercadoLogStoreService', () => {
    let service: MercadoLogStoreService;

    beforeEach(() => {
        service = new MercadoLogStoreService();
    });

    it('deve registrar um mercado para uma data', () => {
        const mercado = new Mercado(CODIGOSETOR.BANHO);
        const date = new Date('2025-06-01');

        service.register(date, mercado);

        const logs = service.find();
        const key = date.toISOString().split('T')[0];
        expect(logs.has(key)).toBe(true);
        expect(logs.get(key)).toEqual([mercado]);
    });

    it('deve adicionar múltiplos mercados para uma mesma data', () => {
        const date = new Date('2025-06-01');
        const mercado1 = new Mercado(CODIGOSETOR.BANHO);
        const mercado2 = new Mercado(CODIGOSETOR.BANHO);

        service.register(date, mercado1);
        service.register(date, mercado2);

        const logs = service.find();
        const key = date.toISOString().split('T')[0];
        expect(logs.get(key)).toEqual([mercado1, mercado2]);
    });

    it('deve registrar mercados em datas diferentes separadamente', () => {
        const date1 = new Date('2025-06-01');
        const date2 = new Date('2025-06-02');
        const mercado1 = new Mercado(CODIGOSETOR.BANHO);
        const mercado2 = new Mercado(CODIGOSETOR.BANHO);

        service.register(date1, mercado1);
        service.register(date2, mercado2);

        const logs = service.find();
        const key1 = date1.toISOString().split('T')[0];
        const key2 = date2.toISOString().split('T')[0];

        expect(logs.get(key1)).toEqual([mercado1]);
        expect(logs.get(key2)).toEqual([mercado2]);
    });
});
