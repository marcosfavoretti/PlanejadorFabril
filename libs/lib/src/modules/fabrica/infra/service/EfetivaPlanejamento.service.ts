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
      const novosSnapshots =
        planejamentosTemporarios.map((planejamentoTemp) =>
          this.criarSnapshot(fabrica, planejamentoTemp),
        );

      console.log('quero ver', planejamentosTemporarios)

      // busca os snapshots já existentes
      // const snapshotsExistentes = await this.planejamentoSnapShotRepository.find({
      //   where: { fabrica: { fabricaId: fabrica.fabricaId } },
      // });

      // atualiza a fabrica com todos
      // const fabricaAtualizada = await this.fabricaService.saveFabrica(fabrica);

      const snapShotsSalvos = await this.planejamentoSnapShotRepository.save(novosSnapshots);
      return snapShotsSalvos;
    } catch (error) {
      console.error(error);
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
  private criarSnapshot(
    fabrica: Fabrica,
    planejamentoTemp: PlanejamentoTemporario,
  ): PlanejamentoSnapShot {

    const acao = this.resolveAcao(planejamentoTemp.qtd);

    return this.planejamentoSnapShotRepository.create({
      fabrica: fabrica,
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
