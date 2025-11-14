import {
  AlocacaoComDependenciaProps,
  AlocacaoSemDependenciaProps,
  MetodoDeAlocacao,
} from '../abstract/MetodoDeAlocacao';
import { Fabrica } from '@libs/lib/modules/fabrica/@core/entities/Fabrica.entity';
import { Pedido } from '@libs/lib/modules/pedido/@core/entities/Pedido.entity';
import { CODIGOSETOR } from '../enum/CodigoSetor.enum';
import { ISelecionarItem } from '@libs/lib/modules/item/@core/interfaces/ISelecionarItem';
import { IGerenciadorPlanejamentConsulta } from '@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta';
import { PlanejamentoTemporario } from '../classes/PlanejamentoTemporario';
import { IVerificaCapacidade } from '@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade';
import { VerificaCapabilidade } from '@libs/lib/modules/fabrica/@core/classes/VerificaCapabilidade';
import { SelecionaItemDep } from '@libs/lib/modules/fabrica/@core/classes/SelecionaItemDep';

export class AlocaItensDependencias extends MetodoDeAlocacao {
  constructor(
    gerenciador: IGerenciadorPlanejamentConsulta,
    readonly selecionador: ISelecionarItem = new SelecionaItemDep(),
  ) {
    super(gerenciador, selecionador);
  }

  verificacaoCapacidade(
    pedido: Pedido,
    codigoSetor: CODIGOSETOR,
  ): IVerificaCapacidade {
    return new VerificaCapabilidade(pedido.item, codigoSetor);
  }

  protected diasPossiveis(
    fabrica: Fabrica,
    pedido: Pedido,
    setor: CODIGOSETOR,
  ): Promise<Date[]> {
    throw new Error('NOT IMPLEMENTED');
  }

  protected alocacao(
    props: AlocacaoSemDependenciaProps,
  ): Promise<PlanejamentoTemporario[]> {
    throw new Error('NOT IMPLEMENTED');
  }

  protected async alocacaoComDependencia(
    props: AlocacaoComDependenciaProps,
  ): Promise<PlanejamentoTemporario[]> {
    let planejadosBase = props.planBase!.filter((p) => p.setor === props.setor);
    if (!planejadosBase.length && props.setor === CODIGOSETOR.PINTURAPO)
      planejadosBase = props.planBase!.filter(
        (p) => p.setor === CODIGOSETOR.PINTURALIQ,
      );
    const planejados: PlanejamentoTemporario[] = planejadosBase.map((p) => ({
      dia: p.dia,
      item: props.itemContext,
      pedido: p.pedido,
      qtd: p.qtd,
      setor: props.setor,
    }));

    return planejados;
  }
}
