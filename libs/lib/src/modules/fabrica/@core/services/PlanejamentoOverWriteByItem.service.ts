import { PlanejamentoSnapShot } from '../entities/PlanejamentoSnapShot.entity';
import { IGerenciaOverwrite } from '../interfaces/IGerenciaOverwrite';

/**
 * @description
 * classe responsável por nao apenas deixar o overwrite se o setor, dia e item forem iguais. Logo qualquer item que tiver no mesmo dia com um id na frente vai sobreescrever o primeiro planejado
 */
export class PlanejamentoOverWriteByItemService
  implements IGerenciaOverwrite<PlanejamentoSnapShot>
{
  constructor() {}

  resolverOverwrite(data: PlanejamentoSnapShot[]): PlanejamentoSnapShot[] {
    data.sort((a, b) => a.planejamentoSnapShotId - b.planejamentoSnapShotId);
    const resultadoMap = new Map<string, PlanejamentoSnapShot>();
    for (const snapshot of data) {
      const item = snapshot.planejamento.item.Item;
      const dia = snapshot.planejamento.dia.toISOString();
      const setor = snapshot.planejamento.setor.codigo;
      const key = `${item}|${dia}|${setor}`;
      if (snapshot.tipoAcao === 'delete') {
        resultadoMap.delete(key);
      } else {
        resultadoMap.set(key, snapshot);
      }
    }
    return Array.from(resultadoMap.values());
  }
}
