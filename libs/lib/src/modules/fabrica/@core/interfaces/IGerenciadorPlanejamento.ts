import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { PlanejamentoSnapShot } from "../entities/PlanejamentoSnapShot.entity";

export interface IGerenciadorPlanejamentoMutation {
    appendPlanejamento(fabrica: Fabrica, pedido: Pedido, planejamentos: PlanejamentoTemporario[]): Promise<Planejamento[]>;
    appendReplanejamento(fabrica: Fabrica, pedido: Pedido, planejamentosOriginais: PlanejamentoSnapShot[], planejamentosNovos: PlanejamentoTemporario[]): Promise<Planejamento[]>;
    removePlanejamento(
        fabrica: Fabrica,
        planejamento: PlanejamentoSnapShot
    ): Promise<void>
}

export const IGerenciadorPlanejamentoMutation = Symbol('IGerenciadorPlanejamentoMutation');