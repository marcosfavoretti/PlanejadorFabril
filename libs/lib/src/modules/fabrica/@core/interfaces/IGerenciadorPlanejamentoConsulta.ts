import { PlanejamentoTemporario } from "../../../planejamento/@core/classes/PlanejamentoTemporario";
import { Item } from "../../../item/@core/entities/Item.entity";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { Fabrica } from "../entities/Fabrica.entity";
import { IVerificaCapacidade } from "./IVerificaCapacidade";

export interface IGerenciadorPlanejamentConsulta {
    possoAlocarQuantoNoDia(fabrica: Fabrica, dia: Date, setor: CODIGOSETOR, item: Item, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number>;
    possoAlocarNoDia(fabrica: Fabrica, dia: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<boolean>;
    diaParaAdiantarProducaoEncaixe(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Date[]>;
    diaParaAdiarProducaoEncaixe(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Date[]>;
    /**
     * 
     * @param fabrica 
     * @param dataPonteiro 
     * @param setor 
     * @param item 
     * @description retorna dias com possibilidade de alocacao (qtd>0) e tambem quantidades possiveis de serem planejadas no mesmo
     */
    rangeDeDiasPossiveisRetroativos(
        fabrica: Fabrica,
        dataPonteiro: Date,
        setor: CODIGOSETOR,
        item: Item,
        qtd: number,
        estrategiaVerificacao: IVerificaCapacidade,
        qtdDias?: number,
        planTemp?: PlanejamentoTemporario[]
    ): Promise<Map<Date, number>>;
}

export const IGerenciadorPlanejamentConsulta = Symbol('IGerenciadorPlanejamentConsulta');