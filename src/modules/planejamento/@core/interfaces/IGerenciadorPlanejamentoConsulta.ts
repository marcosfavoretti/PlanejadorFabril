import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { Item } from "../entities/Item.entity";
import { Pedido } from "../entities/Pedido.entity";
import type { Planejamento } from "../entities/Planejamento.entity";
import type { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

export interface IGerenciadorPlanejamentConsulta {
    getPlanejamentoByPedido(...pedidos: Pedido[]): Promise<PlanejamentoDiario[]>;
    getPlanejamentos(): Array<PlanejamentoDiario>;
    diaComFolgaNaProducao(pointerDate: Date, planejamento: Planejamento): Promise<Date[]>;
    diaParaAdiantarProducao(dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number): Promise<Date>;
    possoAlocarQuantoNoDia(dia: Date, setor: CODIGOSETOR, item: Item,planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<number>;
    possoAlocarNoDia(dia: Date, setor: CODIGOSETOR, item: Item, qtd: number,planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<boolean>;
    diaParaAdiantarProducaoEncaixe(dataPonteiro: Date, setor: CODIGOSETOR, item: Item, qtd: number, planejamentosTemporarios?: PlanejamentoTemporario[]): Promise<Date[]>;
}

export const IGerenciadorPlanejamentConsulta = Symbol('IGerenciadorPlanejamentConsulta');