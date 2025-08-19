import { PlanejamentoTemporario } from "../../../planejamento/@core/classes/PlanejamentoTemporario";
import { Item } from "../../../item/@core/entities/Item.entity";
import { CODIGOSETOR } from "../../../planejamento/@core/enum/CodigoSetor.enum";
import { Fabrica } from "../entities/Fabrica.entity";
import { IVerificaCapacidade } from "./IVerificaCapacidade";

export interface IGerenciadorPlanejamentConsulta {
    // getPlanejamentoByPedido(fabrica: Fabrica, ...pedidos: Pedido[]): Promise<Planejamento[]>;
    // diaComFolgaNaProducao(fabrica: Fabrica, pointerDate: Date, planejamento: Planejamento): Promise<Date[]>;
    // diaParaAdiantarProducao(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade,): Promise<Date>;
    possoAlocarQuantoNoDia(fabrica: Fabrica, dia: Date, setor: CODIGOSETOR, item: Item, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number>;
    possoAlocarNoDia(fabrica: Fabrica, dia: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<boolean>;
    diaParaAdiantarProducaoEncaixe(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Date[]>;
    diaParaAdiarProducaoEncaixe(fabrica: Fabrica, dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, estrategiaVerificacao: IVerificaCapacidade, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Date[]>;

}

export const IGerenciadorPlanejamentConsulta = Symbol('IGerenciadorPlanejamentConsulta');