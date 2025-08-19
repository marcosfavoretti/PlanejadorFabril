import { Setor } from "src/modules/setor/@core/entities/Setor.entity";
import { Item } from "../../../item/@core/entities/Item.entity";

export class Mercado {
    private estoque: Map<string, number>;
    constructor(private setor: Setor, estoque?: Map<string, number>) {
        estoque ? this.estoque = estoque : this.estoque = new Map();
    }

    getSetor(): Setor {
        return this.setor;
    }

    getEstoque(itemCodigo: string): number {
        return this.estoque.get(itemCodigo) || 0;
    }

    copy(): Mercado {
        return new Mercado(
            this.setor,
            new Map(this.estoque)
        );
    }

    concatMercado(mercado: Mercado): void {
        for (const [key, values] of mercado.mercadoEntries()) {
            const valorAtual = this.estoque.get(key) || 0;
            this.estoque.set(key, valorAtual + values);
        }
    }

    subtrairMercados(mercadoDescontado: Mercado): void {
        for (const [key, value] of this.mercadoEntries()) {
            const v2 = mercadoDescontado.estoque.get(key) || 0;
            this.estoque.set(key, value - v2);
        }
    }

    display(): void {
        console.log('=== Estoque ===');
        for (const [key, value] of this.estoque.entries()) {
            console.log(`Item: ${key} | Quantidade: ${value}`);
        }
        console.log('=== ===== ===');

    }

    mercadoEntries(): IterableIterator<[string, number]> {
        return this.estoque.entries();
    }

    addEstoque(item: Item, estoque: number): void {
        const valorAtual = this.estoque.get(item.getCodigo()) || 0;
        this.estoque.set(item.getCodigo(), valorAtual + estoque);
    }
}