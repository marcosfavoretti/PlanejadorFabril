import { Mercado } from "src/modules/planejamento/@core/classes/Mercado";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

describe('teste da classe Mercado', () => {
    it('deve concatenar dois mercados em um só somando chaves iguais', () => {
        const a = new Mercado(CODIGOSETOR.SOLDA,new Map([['1', 2], ['2', 3]]));
        const b = new Mercado(CODIGOSETOR.SOLDA,new Map([['1', 5], ['2', 1]]));
        a.concatMercado(b);
        expect(a.getEstoque('1')).toBe(7);
        expect(a.getEstoque('2')).toBe(4);
    });

    it('deve subtrair dois mercados em um só subtraindo chaves iguais', () => {
        const a = new Mercado(CODIGOSETOR.SOLDA, new Map([['1', 2], ['2', 3]]));
        const b = new Mercado(CODIGOSETOR.SOLDA, new Map([['1', 5], ['2', 1]]));
        a.subtrairMercados(b);
        expect(a.getEstoque('1')).toBe(-3);
        expect(a.getEstoque('2')).toBe(2);
    });
});