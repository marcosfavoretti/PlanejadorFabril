import { PlanejamentoSnapShot } from "../entities/PlanejamentoSnapShot.entity";
import { IGerenciaOverwrite } from "../interfaces/IGerenciaOverwrite";


/**
 * @description
 * classe responsável por nao apenas deixar o overwrite se o pedido, setor, dia e item forem iguais.
 */
export class PlanejamentoOverWriteByPedidoService implements IGerenciaOverwrite<PlanejamentoSnapShot> {
    constructor() { }


    resolverOverwrite(data: PlanejamentoSnapShot[]): PlanejamentoSnapShot[] {
        try {
            data.sort((a, b) => a.planejamentoSnapShotId - b.planejamentoSnapShotId);
            const resultadoMap = new Map<string, PlanejamentoSnapShot>();
            for (const snapshot of data) {
                // console.log(snapshot.planejamentoSnapShotId);
                const item = snapshot.planejamento.item.Item;
                const dia = snapshot.planejamento.dia.toISOString().slice(0, 10); // só AAAA-MM-DD
                const setor = snapshot.planejamento.setor.codigo;
                const pedido = snapshot.planejamento.pedido.id;
                const key = `${item}|${dia}|${setor}|${pedido}`;
                if (snapshot.tipoAcao === 'delete') {
                    resultadoMap.delete(key);
                } else {
                    resultadoMap.set(key, snapshot);
                }
            }
            return Array.from(resultadoMap.values());
        } catch (error) {
            console.log('errro no override', error)
            throw error;
        }
    }
}