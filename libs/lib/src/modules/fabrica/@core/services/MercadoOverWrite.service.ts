import { MercadoSnapShot } from "../entities/MercadoSnapShot.entity";

export class MercadoOverWriteService {
    constructor() { }

    manager(data: MercadoSnapShot[]): MercadoSnapShot[] {
        data.sort((a, b) => a.mercadoSnapShotId - b.mercadoSnapShotId);
        const resultadoMap = new Map<string, MercadoSnapShot>();
        for (const snapshot of data) {
            const item = snapshot.mercado.item.Item;
            const dia = snapshot.mercado.data.toISOString();
            const key = `${item}|${dia}`;
            resultadoMap.set(key, snapshot);
        }
        return Array.from(resultadoMap.values());
    }
}