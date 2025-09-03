import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentConsulta } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { ISelecionarItem } from "@libs/lib/modules/fabrica/@core/interfaces/ISelecionarItem";
import { AlocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/AlocacaoProps";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";

export type HookAlocacaoProps = AlocacaoProps & {
    setor: CODIGOSETOR,
    planDoProximoSetor?: PlanejamentoTemporario[]
};

export type AlocacaoComDependenciaProps = HookAlocacaoProps & {
    planDoProximoSetor: PlanejamentoTemporario[]
    itemContext: Item
}

export type AlocacaoSemDependenciaProps = {
    fabrica: Fabrica,
    pedido: Pedido,
    setor: CODIGOSETOR,
    dias: Date[],
    itemContext: Item
}

export abstract class MetodoDeAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta,
        protected Itemselecionador: ISelecionarItem
    ) { }

    protected abstract diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]>;

    protected abstract alocacao(
        props: AlocacaoSemDependenciaProps
    ): Promise<PlanejamentoTemporario[]>;

    protected abstract alocacaoComDependencia(
        props: AlocacaoComDependenciaProps
    ): Promise<PlanejamentoTemporario[]>;

    public async hookAlocacao(
        props: HookAlocacaoProps
    ): Promise<PlanejamentoTemporario[]> {
        const itemContext = this.Itemselecionador.seleciona(props.estrutura);
        
        if(!itemContext) throw new Error('Não foi selecionado nenhuma item');

        const planejamento: PlanejamentoTemporario[] = [];
        if ((props.planDoProximoSetor && props.planDoProximoSetor.length) || (props.planBase && props.planBase.length)) {
            // const alocacao = await this.alocacaoComDependencia(props.fabrica, props.pedido, props.setor, props.planDoProximoSetor);
            const alocacao = await this.alocacaoComDependencia({
                ...props,
                itemContext,
                planDoProximoSetor: props.planDoProximoSetor || props.planBase || []
            });
            planejamento.push(...alocacao);
        }
        else {
            const diasDoSetor = await this.diasPossiveis(props.fabrica, props.pedido, props.setor);
            const alocacao = await this.alocacao({
                dias: diasDoSetor,
                fabrica: props.fabrica,
                pedido: props.pedido,
                setor: props.setor,
                itemContext
            });
            planejamento.push(...alocacao);
        }
        return planejamento
    }

    abstract verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade
}
