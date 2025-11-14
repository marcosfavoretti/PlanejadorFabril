import { IGerenciadorPlanejamentConsulta } from '@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta';
import {
  MetodoDeReAlocacao,
  RealocacaoComDepedenciaProps,
  RealocacaoSemDependenciaProps,
} from '../abstract/MetodoDeReAlocacao';
import { ISelecionarItem } from '@libs/lib/modules/item/@core/interfaces/ISelecionarItem';
import { Calendario } from '@libs/lib/modules/shared/@core/classes/Calendario';
import { RealocacaoParcial } from '@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial';

export class RealocaDependenciaService extends MetodoDeReAlocacao {
  constructor(
    gerenciador: IGerenciadorPlanejamentConsulta,
    public selecionador: ISelecionarItem,
  ) {
    super(gerenciador, selecionador);
  }
  protected calendario: Calendario;

  protected async realocacao(
    props: RealocacaoSemDependenciaProps,
  ): Promise<RealocacaoParcial> {
    const resultado = new RealocacaoParcial();
    resultado.adicionado = [
      {
        ...props.planFalho,
        item: props.itemContext,
        dia: props.novoDia,
      },
    ];
    resultado.retirado = [props.planFalho];
    return resultado;
  }

  protected async realocacaoComDepedencia(
    props: RealocacaoComDepedenciaProps,
  ): Promise<RealocacaoParcial> {
    const resultado = new RealocacaoParcial();
    resultado.adicionado = [
      {
        ...props.planFalho,
        item: props.itemContext,
        dia: props.novoDia,
      },
    ];
    resultado.retirado = [props.planFalho];
    return resultado;
  }
}
