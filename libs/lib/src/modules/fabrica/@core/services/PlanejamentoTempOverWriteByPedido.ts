import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { PlanejamentoSnapShot } from "../entities/PlanejamentoSnapShot.entity";
import { IGerenciaOverwrite } from "../interfaces/IGerenciaOverwrite";


/**
 * @description
 * classe responsável por nao apenas deixar o overwrite se o pedido, setor, dia e item forem iguais.
 */
export class PlanejamentoTempOverWriteByPedidoService implements IGerenciaOverwrite<PlanejamentoTemporario> {
    constructor() { }


    resolverOverwrite(data: PlanejamentoTemporario[]): PlanejamentoTemporario[] {
        try {
            const resultadoMap = new Map<string, PlanejamentoTemporario>();
            for (const snapshot of data) {
                const item = snapshot.item.Item;
                const dia = snapshot.dia.toISOString();
                const setor = snapshot.setor;
                const pedido = snapshot.pedido.id;
                const key = `${item}|${dia}|${setor}|${pedido}`;
                resultadoMap.set(key, snapshot);
            }
            return Array.from(resultadoMap.values());
        } catch (error) {
            console.log('errro no override', error)
            throw error;
        }
    }


}