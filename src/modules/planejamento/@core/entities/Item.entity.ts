import { Entity, PrimaryColumn, Column } from "typeorm";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

@Entity()
export class Item {
    @PrimaryColumn()
    codigo: string;

    @Column("simple-json")
    operacoes: { [setor: string]: { pc: number, tempo: number, leadTime: number } };

    constructor(
        codigo: string,
        operacoes: { [setor: string]: { pc: number, tempo: number, leadTime: number } }
    ) {
        this.codigo = codigo;
        this.operacoes = operacoes;
    }

    getCodigo(): string {
        return this.codigo;
    }

    toString(): string {
        return this.codigo;
    }

    getLeadtime(setor: CODIGOSETOR): number {
        return this.operacoes[setor]?.leadTime ?? 0;
    }

    produzaPc(setor: CODIGOSETOR): number {
        return this.operacoes[setor]?.pc ?? 0;
    }

    produzaTempo(setor: CODIGOSETOR): number {
        return this.operacoes[setor]?.tempo ?? 0;
    }
}