import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { AlocacaoComDependenciaProps, AlocacaoSemDependenciaProps, MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { VerificaCapabilidade } from "@libs/lib/modules/fabrica/@core/classes/VerificaCapabilidade";
import { AgPlanejamentoInput } from "@libs/lib/modules/ag/@core/classes/AgPlanejamentoInput";

export class AlocaPorCapabilidadeAG
    extends MetodoDeAlocacao {
    
    constructor(
        gerenciador: IGerenciadorPlanejamentConsulta,
        selecionador: ISelecionarItem
    ) {
        super(gerenciador, selecionador);
    }

    protected async alocacao(props: AlocacaoSemDependenciaProps): Promise<PlanejamentoTemporario[]> {
        const diasDeSeguranca = 1;
        const { lote } = props.pedido;
        const capabilidade = props.pedido.item.capabilidade(props.setor);
        const diasNecessario = Math.round(lote / capabilidade);
        const diasRequeridos = diasNecessario + diasDeSeguranca;
        const qtdPorDia = await this.gerenciadorPlan.rangeDeDiasPossiveisRetroativos(
            props.fabrica,
            props.pedido.getSafeDate(),
            props.setor,
            props.pedido.item,
            props.pedido.lote,
            this.verificacaoCapacidade(props.pedido, props.setor),
            diasRequeridos,
        );
        const input: AgPlanejamentoInput = { pedido: props.pedido, qtdPorDia };

    }

    protected async alocacaoComDependencia(props: AlocacaoComDependenciaProps): Promise<PlanejamentoTemporario[]> {

    }

    protected async diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        return [];
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaCapabilidade(pedido.item, codigoSetor);
    }



}
