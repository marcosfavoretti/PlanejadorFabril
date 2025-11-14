import { Inject } from '@nestjs/common';
import { Calendario } from '@libs/lib/modules/shared/@core/classes/Calendario';
import { Between } from 'typeorm';
import { CODIGOSETOR } from '@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum';
import { TabelaProducaoRepository } from '../repositories/TabelaProducao.repository';
import { TabelaProducao } from '@libs/lib/modules/planejamento/@core/entities/TabelaProducao.entity';
import { Planejamento } from '../../@core/entities/Planejamento.entity';
import { IOnNovoPlanejamentos } from '@libs/lib/modules/fabrica/@core/interfaces/IOnNovoPlanejamento';
import { Fabrica } from '@libs/lib/modules/fabrica/@core/entities/Fabrica.entity';

export class TabelaProducaoService implements IOnNovoPlanejamentos {
  @Inject(TabelaProducaoRepository)
  private tabelaProducaoRepo: TabelaProducaoRepository;
  private calendario = new Calendario();
  constructor() {}

  async execute(
    fabrica: Fabrica,
    planejamentos: Planejamento[],
  ): Promise<void> {
    console.log('gerando tabela');
    await this.gerarTabelaParaPlanejados(planejamentos);
  }

  async consultarFalhasUltimoDia(
    ponteiro: Date,
    setor: CODIGOSETOR,
  ): Promise<TabelaProducao[]> {
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

  async gerarTabelaParaPlanejados(
    planejados: Planejamento[],
  ): Promise<TabelaProducao[]> {
    try {
      const tabelasProducao = planejados.map((plan) =>
        this.tabelaProducaoRepo.create({
          planejamento: plan,
          produzido: 0,
        }),
      );
      return await this.tabelaProducaoRepo.save(tabelasProducao);
    } catch (error) {
      throw new Error('Falha ao salvar tabela de producao para os planejados');
    }
  }

  async consultarUltimoDia(
    ponteiro: Date,
    setor: CODIGOSETOR,
  ): Promise<TabelaProducao[]> {
    ponteiro = this.calendario.ultimoDiaUtil(ponteiro, false);
    // console.log(ponteiro)
    return await this.tabelaProducaoRepo.find({
      where: {
        planejamento: {
          setor: {
            codigo: setor,
          },
          dia: Between(
            this.calendario.inicioDoDia(ponteiro),
            this.calendario.finalDoDia(ponteiro),
          ),
        },
      },
      relations: {
        planejamento: true,
      },
    });
  }

  async consultarTabelaPorDia(
    inicial: Date,
    final: Date,
  ): Promise<TabelaProducao[]> {
    try {
      return await this.tabelaProducaoRepo.find({
        where: {
          planejamento: {
            dia: Between(
              this.calendario.inicioDoDia(inicial),
              this.calendario.finalDoDia(final),
            ),
          },
        },
        relations: {
          planejamento: {
            setor: true,
            item: true,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
