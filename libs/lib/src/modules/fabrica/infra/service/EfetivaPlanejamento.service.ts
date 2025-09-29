import { Injectable } from "@nestjs/common";
import { PlanejamentoSnapShotRepository } from "../repository/PlanejamentoSnapShot.repository";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";
import { In } from "typeorm";
import { PlanejamentoRepository } from "@libs/lib/modules/planejamento/infra/repositories/Planejamento.repo";

@Injectable()
export class EfetivaPlanejamentoService {

  constructor(
    private readonly planejamentoRepository: PlanejamentoRepository,
    private readonly planejamentoSnapShotRepository: PlanejamentoSnapShotRepository,
  ) { }

  async efetiva(
    fabrica: Fabrica,
    planejamentosTemporarios: PlanejamentoTemporario[],
  ): Promise<PlanejamentoSnapShot[]> {
    try {
      // 1️⃣ Agrupa os planejamentos por chave única para evitar duplicatas
      const summarizePlans = new Map<string, PlanejamentoTemporario>();

      for (const planTemp of planejamentosTemporarios) {
        const key = `${planTemp.setor}-${planTemp.item.getCodigo()}-${planTemp.dia.toISOString()}-${planTemp.pedido.id}`;
        const planInMap = summarizePlans.get(key);
        if (planInMap) {
          planInMap.qtd += planTemp.qtd; // Acumula a quantidade
        } else {
          summarizePlans.set(key, planTemp);
        }
      }

      // 2️⃣ Cria os objetos de snapshot e planejamento em memória (sem salvar)
      const novosSnapshots = Array.from(summarizePlans.values()).map(plan => 
        this.criarSnapshot(fabrica, plan)
      );

      // Se não houver snapshots para criar, retorna um array vazio.
      if (novosSnapshots.length === 0) {
        return [];
      }

      // 3️⃣ Extrai e salva APENAS os planejamentos para obter seus IDs
      const planejamentosParaSalvar = novosSnapshots.map(snapshot => snapshot.planejamento);
      const insertResultPlanejamentos = await this.planejamentoRepository.insert(planejamentosParaSalvar);

      // 4️⃣ O PONTO CRÍTICO: Atribui os IDs gerados de volta aos objetos em memória
      // Isso garante que a relação de chave estrangeira seja estabelecida corretamente.
      novosSnapshots.forEach((snapshot, index) => {
        const newId = insertResultPlanejamentos.identifiers[index].planejamentoId; // ou o nome correto da sua PK
        snapshot.planejamento.planejamentoId = newId;
      });

      // 5️⃣ Agora sim, com os IDs de planejamento corretos, salva os snapshots
      const insertResultSnapshots = await this.planejamentoSnapShotRepository.insert(novosSnapshots);

      // 6️⃣ Retorna os snapshots recém-criados e salvos para confirmação
      const ids = insertResultSnapshots.identifiers.map(i => i.planejamentoSnapShotId);
      
      const planejamentosSalvos = await this.planejamentoSnapShotRepository.find({
        where: {
          planejamentoSnapShotId: In(ids)
        },
        // Adicione as relações que você precisa que sejam carregadas
        relations: ['planejamento', 'planejamento.item', 'planejamento.pedido'],
      });

      return planejamentosSalvos;

    } catch (error) {
      console.error(error);
      throw new Error(`Problemas para salvar o planejamento: ${(error as Error).message}`);
    }
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
        async remove(fabrica: Fabrica, ...planejamento: PlanejamentoSnapShot[]): Promise<void> {
          const snapShotClone = planejamento.map(pl => pl.copy());
          snapShotClone.forEach(snap => {
            snap.tipoAcao = SnapShotEstados.delete;
            snap.fabrica = fabrica;
          })
          await this.planejamentoSnapShotRepository.save(snapShotClone);
        }

  /**
   * Resolve a ação do snapshot a partir da quantidade
   */
  private resolveAcao(qtd: number): SnapShotEstados {
    return qtd === 0 ? SnapShotEstados.delete : SnapShotEstados.base;
  }
}
