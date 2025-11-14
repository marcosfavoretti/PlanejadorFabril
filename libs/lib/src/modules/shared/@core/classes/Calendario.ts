import type { IDiasPossiveis } from '../interfaces/IDiasPossiveis';
import * as datefns from 'date-fns';
export class Calendario implements IDiasPossiveis {
  /**
   *
   * @param end
   * @param qtdDias
   * @returns
   * @description com base em uma data ele retorna um array de dias válidos anteriores a essa data
   */

  diasPossiveis(end: Date, qtdDias: number): Array<Date> {
    const dias: Date[] = [];
    let dataAtual = end;

    while (dias.length < qtdDias) {
      if (!datefns.isWeekend(dataAtual)) {
        dias.push(new Date(dataAtual));
      }
      dataAtual = this.subDays(dataAtual, 1);
    }

    dias.sort((a, b) => a.getTime() - b.getTime());
    return dias;
  }

  proximoDiaUtil(dia: Date, validaAtual: boolean): Date {
    if (!validaAtual) dia = this.addDays(dia, 1);

    while (datefns.isWeekend(dia)) {
      dia = datefns.addDays(dia, 1);
    }
    return datefns.startOfDay(dia);
  }

  ehMesmoDia(a: Date, b: Date): boolean {
    return datefns.isSameDay(a, b);
  }

  ultimoDiaUtil(dia: Date, validaAtual: boolean): Date {
    if (!validaAtual) dia = this.subDays(dia, 1);
    while (datefns.isWeekend(dia)) {
      dia = datefns.subDays(dia, 1);
    }
    return datefns.startOfDay(dia);
  }

  proximoDiaUtilReplanejamento(dia: Date): Date {
    const amanha = datefns.startOfTomorrow();

    let candidato = datefns.isAfter(dia, amanha) ? dia : amanha;

    while (datefns.isWeekend(candidato)) {
      candidato = datefns.addDays(candidato, 1);
    }

    return candidato;
  }

  finalDoDia(date: Date): Date {
    return datefns.endOfDay(date);
  }

  inicioDoDia(date: Date): Date {
    return datefns.startOfDay(date);
  }

  parse(datestr: string): Date {
    return datefns.parse(datestr, 'dd/MM/yyyy', new Date());
  }

  format(date: Date): string {
    return datefns.format(date, 'yyyy-MM-dd');
  }

  addBusinessDays(date: Date, sub: number): Date {
    return datefns.addBusinessDays(date, sub);
  }
  addDays(date: Date, sub: number): Date {
    return datefns.addDays(date, sub);
  }

  subDays(date: Date, sub: number): Date {
    return datefns.subDays(date, sub);
  }
}
