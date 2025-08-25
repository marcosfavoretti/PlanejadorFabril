import { AlocacaoComDependenciaProps, AlocacaoSemDependenciaProps, MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { ISelecionarItem } from "src/modules/fabrica/@core/interfaces/ISelecionarItem";
import { IGerenciadorPlanejamentConsulta } from "src/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { IVerificaCapacidade } from "src/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { VerificaCapabilidade } from "src/modules/fabrica/@core/classes/VerificaCapabilidade";
import { subDays } from "date-fns";

export class AlocaItensDependencias extends MetodoDeAlocacao {

    constructor(
        gerenciador: IGerenciadorPlanejamentConsulta,
        selecionador: ISelecionarItem
    ) {
        super(gerenciador, selecionador);
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaCapabilidade(pedido.item, codigoSetor);
    }

    protected diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        throw new Error('NOT IMPLEMENTED');
    }

    protected alocacao(props: AlocacaoSemDependenciaProps): Promise<PlanejamentoTemporario[]> {
        throw new Error('NOT IMPLEMENTED');
    }

    protected async alocacaoComDependencia(props: AlocacaoComDependenciaProps): Promise<PlanejamentoTemporario[]> {
        props.setor === CODIGOSETOR.PINTURAPO && console.log('PINTURA PO')
        let planejadosBase = props.planBase!.filter(p => p.setor === props.setor);
        if (!planejadosBase.length && props.setor === CODIGOSETOR.PINTURAPO) planejadosBase = props.planBase!.filter(p => p.setor === CODIGOSETOR.PINTURALIQ);
        const planejados: PlanejamentoTemporario[] = planejadosBase.map(p => ({
            dia: p.dia,
            item: props.itemContext,
            pedido: p.pedido,
            qtd: p.qtd,
            setor: props.setor,
        }));
        console.log(planejados)
        return planejados;
    }
}