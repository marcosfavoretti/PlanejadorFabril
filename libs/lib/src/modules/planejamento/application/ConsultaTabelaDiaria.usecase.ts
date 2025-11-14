import { Inject, InternalServerErrorException } from '@nestjs/common';
import { Calendario } from '@libs/lib/modules/shared/@core/classes/Calendario';
import { GetTabelaProducaoDiarioDTO } from '@dto/GetTabelaProducaoDiario.dto';
import { InvalidDateException } from '../../fabrica/@core/exception/InvalidDate.exception';
import { TabelaProducaoService } from '../infra/services/TabelaProducao.service';
type GenerateProps = {
  startDate: string;
  endDate: string;
};

export class ConsultaTabelaDiariaUseCase {
  private calendario = new Calendario();
  constructor(
    @Inject(TabelaProducaoService)
    private tabelaProducaoService: TabelaProducaoService,
  ) {}

  async generate(filter: GenerateProps): Promise<GetTabelaProducaoDiarioDTO[]> {
    try {
      if (Object.values(filter).every((i) => !i)) {
        throw new InvalidDateException();
      }
      const rangeDate = [
        this.calendario.parse(filter.startDate),
        this.calendario.parse(filter.endDate),
      ];
      const tabelaDeProducao =
        await this.tabelaProducaoService.consultarTabelaPorDia(
          rangeDate[0],
          rangeDate[1],
        );
      const serialize: GetTabelaProducaoDiarioDTO[] = tabelaDeProducao.map(
        (t) => {
          return {
            tabelaProducaoId: t.tabelaProducaoId,
            produzido: t.produzido,
            setor: t.planejamento.setor.codigo,
            planejamento: t.planejamento.qtd,
            item: t.planejamento.item.getCodigo(),
          };
        },
      );
      return serialize;
    } catch (error) {
      if (error instanceof InvalidDateException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao gerar a tabela de planejamentos',
      );
    }
  }
}
