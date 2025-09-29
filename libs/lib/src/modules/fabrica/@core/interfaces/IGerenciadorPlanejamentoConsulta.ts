import { PlanejamentoTemporario } from "../../../planejamento/@core/classes/PlanejamentoTemporario";
import { Item } from "../../../item/@core/entities/Item.entity";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { IVerificaCapacidade } from "./IVerificaCapacidade";

export interface IGerenciadorPlanejamentConsulta {
    possoAlocarQuantoNoDia(dia: Date, setor: CODIGOSETOR, item: Item, estrategiaVerificacao: IVerificaCapacidade, planejamentoBanco: PlanejamentoTemporario[], planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number>;
    possoAlocarNoDia(dia: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentoBanco: PlanejamentoTemporario[], planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<boolean>;
    diaParaAdiantarProducaoEncaixe(dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade,planejamentoBanco: PlanejamentoTemporario[], planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Map<Date, number>>;
    diaParaAdiarProducaoEncaixe(dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade,planejamentoBanco: PlanejamentoTemporario[], planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Map<Date, number>>;
    // /**
    //  * 
    //  * @param fabrica 
    //  * @param dataPonteiro 
    //  * @param setor 
    //  * @param item 
    //  * @description retorna dias com possibilidade de alocacao (qtd>0) e tambem quantidades possiveis de serem planejadas no mesmo
    //  */
    // rangeDeDiasPossiveisRetroativos(
    //     fabrica: Fabrica,
    //     dataPonteiro: Date,
    //     setor: CODIGOSETOR,
    //     item: Item,
    //     qtd: number,
    //     estrategiaVerificacao: IVerificaCapacidade,
    //     qtdDias?: number,
    //     planTemp?: PlanejamentoTemporario[]
    // ): Promise<Map<Date, number>>;
}

export const IGerenciadorPlanejamentConsulta = Symbol('IGerenciadorPlanejamentConsulta');