import { Injectable } from "@nestjs/common";
import { PlanejamentoSnapShotRepository } from "../repository/PlanejamentoSnapShot.repository";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";
import { FabricaService } from "./Fabrica.service";

@Injectable()
export class EfetivaPlanejamentoService {

  constructor(
    private readonly fabricaService: FabricaService,
    private readonly planejamentoSnapShotRepository: PlanejamentoSnapShotRepository,
  ) { }

  /**
   * @param fabrica 
   * @param planejamentosTemporarios 
   * @returns 
   * @description funcao especializadas em salvar os snapshots no banco de dados
   */
  async efetiva(
    fabrica: Fabrica,
    planejamentosTemporarios: PlanejamentoTemporario[],
  ): Promise<PlanejamentoSnapShot[]> {
    try {
      // resolve todos os snapshots em paralelo
      const novosSnapshots = await Promise.all(
        planejamentosTemporarios.map((planejamentoTemp) =>
          this.criarSnapshot(fabrica, planejamentoTemp),
        ),
      );

      // busca os snapshots já existentes
      const snapshotsExistentes = await this.planejamentoSnapShotRepository.find({
        where: { fabrica: { fabricaId: fabrica.fabricaId } },
      });

      // atualiza a fabrica com todos
      fabrica.appendPlanejamento([...novosSnapshots, ...snapshotsExistentes]);
      console.log(novosSnapshots)
      const fabricaAtualizada = await this.fabricaService.saveFabrica(fabrica);

      return fabricaAtualizada.planejamentoSnapShots;
    } catch (error) {
      throw new Error(`Problemas para salvar o planejamento: ${(error as Error).message}`);
    }
  }

  async remove(fabrica: Fabrica, ...planejamento: PlanejamentoSnapShot[]): Promise<void> {
    const snapShotClone = planejamento.map(pl => pl.copy());
    snapShotClone.forEach(snap => {
      snap.tipoAcao = SnapShotEstados.delete;
      snap.fabrica = fabrica;
    })
    await this.planejamentoSnapShotRepository.save(snapShotClone);
  }

  /**
   * Cria um snapshot resolvendo o item conforme o setor
   */
  private async criarSnapshot(
    fabrica: Fabrica,
    planejamentoTemp: PlanejamentoTemporario,
  ): Promise<PlanejamentoSnapShot> {
    const acao = this.resolveAcao(planejamentoTemp.qtd);

    return this.planejamentoSnapShotRepository.create({
      fabrica,
      planejamento: {
        ...planejamentoTemp,
        item: planejamentoTemp.item,
        setor: planejamentoTemp.setor ? { codigo: planejamentoTemp.setor } : undefined,
      },
      tipoAcao: acao,
    });
  }

  /**
   * Resolve a ação do snapshot a partir da quantidade
   */
  private resolveAcao(qtd: number): SnapShotEstados {
    return qtd === 0 ? SnapShotEstados.delete : SnapShotEstados.base;
  }
}
