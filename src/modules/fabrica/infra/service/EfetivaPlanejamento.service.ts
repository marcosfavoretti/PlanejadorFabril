import { Inject, Injectable } from "@nestjs/common";
import { PlanejamentoSnapShotRepository } from "../repository/PlanejamentoSnapShot.repository";
import { PlanejamentoTemporario } from "src/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";
import { FabricaService } from "./Fabrica.service";
import { IConverteItem } from "src/modules/item/@core/interfaces/IConverteItem";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";

@Injectable()
export class EfetivaPlanejamentoService {
  constructor(
    @Inject(IConverteItem) private readonly converteItem: IConverteItem,
    private readonly fabricaService: FabricaService,
    private readonly planejamentoSnapShotRepository: PlanejamentoSnapShotRepository,
  ) {}

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

      const fabricaAtualizada = await this.fabricaService.saveFabrica(fabrica);

      return fabricaAtualizada.planejamentoSnapShots;
    } catch (error) {
      // mantém o stack original, só adiciona contexto
      throw new Error(`Problemas para salvar o planejamento: ${(error as Error).message}`);
    }
  }

  async remove(fabrica: Fabrica, planejamento: PlanejamentoSnapShot): Promise<void> {
    const snapShotClone = planejamento.copy();
    snapShotClone.tipoAcao = SnapShotEstados.delete;
    snapShotClone.fabrica = fabrica;

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

    const itemResolvido =
      planejamentoTemp.setor === CODIGOSETOR.MONTAGEM
        ? planejamentoTemp.pedido.item
        : await this.converteItem.convete_para_110(planejamentoTemp.pedido.item.Item);

    return this.planejamentoSnapShotRepository.create({
      fabrica,
      planejamento: {
        ...planejamentoTemp,
        item: itemResolvido,
        setor: planejamentoTemp.setor ? { codigo: planejamentoTemp.setor } : undefined,
      },
      tipoAcao: acao,
    });
  }

  /**
   * Resolve a ação do snapshot a partir da quantidade
   */
  private resolveAcao(qtd: number): SnapShotEstados {
    if (qtd === 0) return SnapShotEstados.delete;
    return SnapShotEstados.base;
  }
}
