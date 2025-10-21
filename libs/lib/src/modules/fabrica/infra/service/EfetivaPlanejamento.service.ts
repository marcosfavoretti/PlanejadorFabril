import { Injectable, Logger } from "@nestjs/common";
import { PlanejamentoSnapShotRepository } from "../repository/PlanejamentoSnapShot.repository";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";
import { In } from "typeorm";
import { PlanejamentoRepository } from "@libs/lib/modules/planejamento/infra/repositories/Planejamento.repo";
import { inspect } from "util";

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

            const novosSnapshots = Array.from(summarizePlans.values()).map(plan =>this.criarSnapshot(fabrica, plan));
            
            if (novosSnapshots.length === 0) {
                return [];
            }

            const planejamentosParaSalvar = novosSnapshots.map(snapshot => snapshot.planejamento);
            const insertResultPlanejamentos = await this.planejamentoRepository.insert(planejamentosParaSalvar);

            novosSnapshots.forEach((snapshot, index) => {
                const newId = insertResultPlanejamentos.identifiers[index].planejamentoId; // ou o nome correto da sua PK
                snapshot.planejamento.planejamentoId = newId;
            });

            const insertResultSnapshots = await this.planejamentoSnapShotRepository.insert(novosSnapshots);

            const ids = insertResultSnapshots.identifiers.map(i => i.planejamentoSnapShotId);

            const planejamentosSalvos = await this.planejamentoSnapShotRepository.find({
                where: {
                    planejamentoSnapShotId: In(ids)
                },
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

        fabrica.planejamentoSnapShots = [];
        // 2. Crie o objeto que será passado para o TypeORM
        const dataToCreate = {
            fabrica: fabrica,
            planejamento: {
                dia: planejamentoTemp.dia,
                pedido: planejamentoTemp.pedido,
                qtd: planejamentoTemp.qtd,
                item: planejamentoTemp.item,
                setor: planejamentoTemp.setor ? { codigo: planejamentoTemp.setor } : undefined,
            },
            tipoAcao: acao,
        };

        // 3. LOG DETALHADO: Inspecione o objeto ANTES de passá-lo para o TypeORM
        Logger.warn('--- Inspecionando objeto para repository.create() ---');
        // Usamos 'depth: 2' para ver um nível de profundidade (pedido -> planejamentos)
        // Se a referência circular estiver mais profunda, aumente o depth.
        const inspectedData = inspect(dataToCreate, { depth: 2, colors: true });
        Logger.log(inspectedData);
        Logger.warn('--- Fim da inspeção ---');
        
        // 4. Chame o método do TypeORM
        try {
            const response = this.planejamentoSnapShotRepository.create(dataToCreate);
            Logger.log('repository.create() executado com sucesso.');
            return response;
        } catch (creationError) {
            Logger.fatal('!!! ERRO DENTRO DO repository.create() !!!', (creationError as Error).stack);
            throw creationError;
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
     * Resolve a ação do snapshot a partir da quantidade
     */
    private resolveAcao(qtd: number): SnapShotEstados {
        return qtd === 0 ? SnapShotEstados.delete : SnapShotEstados.base;
    }
}
