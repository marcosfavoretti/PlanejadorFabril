import { Inject } from "@nestjs/common";
import { PlanejamentoDiarioRepository } from "../infra/repositories/PlanejamentoDiario.repo";

export class ConsultarDatasPlanejadasUseCase {
    @Inject(PlanejamentoDiarioRepository) private planejamentoDiarioRepo: PlanejamentoDiarioRepository;

    async consultar(): Promise<Date[]> {
        try {
            const planejamentos = await this.planejamentoDiarioRepo.find({order: {dia: 'asc'}});
            return planejamentos.map(p=>p.dia);
        } catch (error) {
            throw error;
        }   
    }
}