import { Inject } from "@nestjs/common";
import { PlanejamentoRepository } from "../repositories/Planejamento.repo";
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";
import { In } from "typeorm";

export class PlanejamentoService {
    constructor(
        @Inject(PlanejamentoRepository) private planejamentoRepository: PlanejamentoRepository
    ) { }

    async consultaPlanejamento(planejamentoId: number): Promise<Planejamento> {
        return await this.planejamentoRepository.findOneOrFail({
            where: {
                planejamentoId: planejamentoId
            }
        })
    }
    async consultaPlanejamentos(planejamentoId: number[]): Promise<Planejamento[]> {
        return await this.planejamentoRepository.find({
            where: {
                planejamentoId: In(planejamentoId)
            }
        })
    }
}
