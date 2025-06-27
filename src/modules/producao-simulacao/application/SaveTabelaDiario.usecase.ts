import { Inject, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { SalvarTabelaProducaoDiarioDTO } from "src/delivery/dtos/SalvarTabelaProucaoDiario.dto";
import { TabelaProducaoRepository } from "../infra/repositories/TabelaProducao.repository";
import { EntityNotFoundError } from "typeorm";

export class SaveTabelaDiarioUseCase {
    @Inject(TabelaProducaoRepository) private tabelaProducaoRepo: TabelaProducaoRepository;
    async salvar(dto: SalvarTabelaProducaoDiarioDTO): Promise<void> {
        try {
            const targetRow = await this.tabelaProducaoRepo.findOneByOrFail({
                id: dto.id
            });
            targetRow.produzido = dto.produzido;
            const change = await this.tabelaProducaoRepo.save(targetRow);
            console.log(change)
        } catch (error) {
            if (error instanceof EntityNotFoundError) { throw new NotFoundException('Nao foi possivel encontrar o registro para mudança na tabela'); }
            console.error(error);
            throw new InternalServerErrorException('erro ao salvar tabela de producao');
        }
    }
}