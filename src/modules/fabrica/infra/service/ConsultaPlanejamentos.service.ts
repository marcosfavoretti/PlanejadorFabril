import { Inject } from "@nestjs/common";
import { PlanejamentoSnapShotRepository } from "../repository/PlanejamentoSnapShot.repository";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { FabricaRepository } from "../repository/Fabrica.repository";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { Between, In, MoreThanOrEqual } from "typeorm";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { Item } from "src/modules/item/@core/entities/Item.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { Planejamento } from "src/modules/planejamento/@core/entities/Planejamento.entity";
import { IGerenciaOverwrite } from "../../@core/interfaces/IGerenciaOverwrite";
import { FabricaService } from "./Fabrica.service";

export class ConsultaPlanejamentoService {

    constructor(
        @Inject(FabricaService) private fabricaService: FabricaService,
        @Inject(FabricaRepository) private fabricaRepository: FabricaRepository,
        @Inject(PlanejamentoSnapShotRepository) private planejamentoSnapShotRepository: PlanejamentoSnapShotRepository
    ) { }

    private calendario = new Calendario();

    async consultaPlanejamentosSnapShots(fabrica: Fabrica): Promise<PlanejamentoSnapShot[]> {
        const fabricaSnapShots = await this.planejamentoSnapShotRepository.find({
            where: {
                fabrica: {
                    fabricaId: fabrica.fabricaId
                }
            },
        });
        return fabricaSnapShots;
    }

    //para ganho dee performace posso passar como um array nessa consulta para pesquisar tudo em uma vez no bacno
    async consultaPlanejamentoEspecifico(fabrica: Fabrica, planejamento: Planejamento, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot> {
        const fabricasAlvos = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
        const fabricasAlvosIds = fabricasAlvos.map(fabrica => fabrica.fabricaId);
        const planejamentos = await this.planejamentoSnapShotRepository.find({
            where: {
                fabrica: {
                    fabricaId: In(fabricasAlvosIds)
                },
                planejamento: {
                    planejamentoId: planejamento.planejamentoId
                },
            }
        });
        const [ultimoPlanejamento] = overwriteStrategy.resolverOverwrite(planejamentos);
        return ultimoPlanejamento;
    }

    async consultarPlanejamentosFuturos(fabrica: Fabrica, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        const fabricasAlvos = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
        const fabricasAlvosIds = fabricasAlvos.map(fabrica => fabrica.fabricaId);
        const planejamentos = await this.planejamentoSnapShotRepository.find({
            where: {
                fabrica: {
                    fabricaId: In(fabricasAlvosIds)
                },
                planejamento: {
                    dia: MoreThanOrEqual(this.calendario.inicioDoDia(new Date()))
                }
            }
        });
        return await overwriteStrategy.resolverOverwrite(planejamentos);
    }

    async planejamentoDoSetorNoDia(fabrica: Fabrica, setor: CODIGOSETOR, dia: Date, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
        const fabricasAlvoIds = fabricasAlvo.map(fab => fab.fabricaId);
        const planejamentos = await this.planejamentoSnapShotRepository.find({
            where: {
                fabrica: {
                    fabricaId: In(fabricasAlvoIds)
                },
                planejamento: {
                    setor: {
                        codigo: setor
                    },
                    dia: dia
                },
            }
        });
        return overwriteStrategy.resolverOverwrite(planejamentos);
    }

    async planejamentoDoSetor(fabrica: Fabrica, setor: CODIGOSETOR, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
        const fabricasAlvoIds = fabricasAlvo.map(fab => fab.fabricaId);

        const planejamentos = await this.planejamentoSnapShotRepository.find({
            where: {
                fabrica: {
                    fabricaId: In(fabricasAlvoIds)
                },
                planejamento: {
                    setor: {
                        codigo: setor
                    }
                }
            }
        });
        return overwriteStrategy.resolverOverwrite(planejamentos);
    }

    async consultaPorPedido(fabrica: Fabrica, pedido: Pedido[], overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        try {
            const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
            const fabricasAlvoIds = fabricasAlvo.map(fab => fab.fabricaId);
            const pedidosIds = pedido.map(ped => ped.id);
            let snapShotCompleto = await this.planejamentoSnapShotRepository.find({
                where: {
                    fabrica: {
                        fabricaId: In(fabricasAlvoIds)
                    },
                    planejamento: {
                        pedido: {
                            id: In(pedidosIds)
                        }
                    }
                },
                relations: { planejamento: { pedido: true } },
            });
            return overwriteStrategy.resolverOverwrite(snapShotCompleto);
        } catch (error) {
            throw new Error(`Problemas ao consultar fabrica .consultaPorPedido ${error}`);
        }
    }

    async consultaPlanejamentoDia(fabrica: Fabrica, diaInicio: Date, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>, diaFinal?: Date): Promise<PlanejamentoSnapShot[]> {
        try {
            const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
            const snapShotCompleto = await this.planejamentoSnapShotRepository.find({
                where: {
                    fabrica: {
                        fabricaId: In(fabricasAlvo.map(fab => fab.fabricaId))
                    },
                    planejamento: {
                        dia: Between(diaInicio, diaFinal || this.calendario.finalDoDia(diaInicio))
                    }
                },
            });
            return overwriteStrategy
                .resolverOverwrite(snapShotCompleto);
        } catch (error) {
            throw new Error(`Problemas ao consultar fabrica .consultaPlanejamentoDia ${error}`);
        }
    }


    async consultaPlanejamentoAtual(fabrica: Fabrica, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        try {
            const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
            const snapShotCompleto = await this.planejamentoSnapShotRepository.find({
                where: {
                    fabrica: {
                        fabricaId: In(fabricasAlvo.map(fabrica => fabrica.fabricaId))
                    },
                }
            });
            return overwriteStrategy.resolverOverwrite(snapShotCompleto);
        } catch (error) {
            throw new Error(`Problemas ao consultar fabrica .consultaPlaenjaemntoAtual ${error}`)
        }
    }

    async consultaPlanejamentoSnapShot(planejamentoSnapShotId: number):Promise<PlanejamentoSnapShot>{
        return await this.planejamentoSnapShotRepository.findOneOrFail({
            where: {
                planejamentoSnapShotId: planejamentoSnapShotId
            }
        })
    }

    /**
     * @param fabrica 
     * @param item 
     * @param setor 
     * @param dia 
     * @returns consulta os planejados para a fabrica
     */
    async consulta(fabrica: Fabrica, item: Item, setor: CODIGOSETOR, dia: Date, overwriteStrategy: IGerenciaOverwrite<PlanejamentoSnapShot>): Promise<PlanejamentoSnapShot[]> {
        try {
            const fabricasAlvo = await this.fabricaService.consultarFabricasAteCheckPoint(fabrica);
            const snapShotCompleto = await this.planejamentoSnapShotRepository.find({
                where: {
                    fabrica: {
                        fabricaId: In(fabricasAlvo.map(fabrica => fabrica.fabricaId))
                    },
                    planejamento: {
                        setor: {
                            codigo: setor
                        },
                        item: {
                            Item: item.Item
                        },
                        dia: dia
                    }
                }
            });
            return overwriteStrategy
                .resolverOverwrite(snapShotCompleto);
        } catch (error) {
            throw new Error(`Problemas ao consultar fabrica .consulta ${error}`)
        }
    }


}