import { Inject } from "@nestjs/common";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { Between } from "typeorm";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { TabelaProducaoRepository } from "../repositories/TabelaProducao.repository";
import { TabelaProducao } from "src/modules/planejamento/@core/entities/TabelaProducao.entity";

export class TabelaProducaoService {
    @Inject(TabelaProducaoRepository) private tabelaProducaoRepo: TabelaProducaoRepository;
    private calendario = new Calendario();
    constructor() { }

    async consultarFalhasUltimoDia(ponteiro: Date, setor: CODIGOSETOR): Promise<TabelaProducao[]> {
        ponteiro = this.calendario.ultimoDiaUtil(ponteiro, false);
        const inicio = this.calendario.inicioDoDia(ponteiro);
        const fim = this.calendario.finalDoDia(ponteiro);
        return this.tabelaProducaoRepo
            .createQueryBuilder('tabela')
            .innerJoinAndSelect('tabela.planejamento', 'planejamento')
            .leftJoinAndSelect('planejamento.item', 'item')
            .where('tabela.date_planej BETWEEN :inicio AND :fim', { inicio, fim })
            .andWhere('planejamento.setor = :setor', { setor })
            .andWhere('tabela.produzido < planejamento.qtd')
            .getMany();
    }


    async consultarUltimoDia(ponteiro: Date, setor: CODIGOSETOR): Promise<TabelaProducao[]> {
        ponteiro = this.calendario.ultimoDiaUtil(ponteiro, false);
        // console.log(ponteiro)
        return await this.tabelaProducaoRepo.find({
            where: {
                datePlanej: Between(
                    this.calendario.inicioDoDia(ponteiro),
                    this.calendario.finalDoDia(ponteiro)
                ),
                planejamento: {
                    setor: {
                        codigo: setor
                    }
                }
            },
            relations: {
                planejamento: true
            }
        })
    }

    async consultarTabelaPorDia(inicial: Date, final: Date): Promise<TabelaProducao[]> {
        try {
            return await this.tabelaProducaoRepo.find({
                where: {
                    datePlanej: Between(
                        this.calendario.inicioDoDia(inicial),
                        this.calendario.finalDoDia(final)
                    )
                },
                relations: {
                    planejamento: {
                        setor: true,
                        item: true,
                    }
                }
            })
        } catch (error) {
            console.error(error);
            throw error
        }
    }
}