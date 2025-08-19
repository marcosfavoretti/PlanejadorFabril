import { arrayBuffer } from "stream/consumers";
import { DividaSnapShot } from "../entities/DividaSnapShot.entity";
import { IGerenciaOverwrite } from "../interfaces/IGerenciaOverwrite";

export class DividaOverWriteByPedido implements IGerenciaOverwrite<DividaSnapShot> {
    constructor() { }


    resolverOverwrite(data: DividaSnapShot[]): DividaSnapShot[] {
        data.sort((a, b) => a.dividaSnapShotId - b.dividaSnapShotId);
        const resultadoMap = new Map<string, DividaSnapShot[]>();
        for (const snapshot of data) {
            const pedido = snapshot.divida.pedido.id;
            const setor = snapshot.divida.setor.codigo;
            const key = `${pedido}|${setor}`;
            if (snapshot.tipo !== 'delete') {
                const dividas = resultadoMap.get(key) || [];
                dividas.push(snapshot)
                resultadoMap.set(key, dividas);
            }
        }
        return Array.from(resultadoMap.values()).flat();
    }


}