import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial";
import { Item } from "@libs/lib/modules/item/@core/entities/Item.entity";
import { RealocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/RealocaacoProps";
import { ISelecionarItem } from "@libs/lib/modules/item/@core/interfaces/ISelecionarItem";


export type HookRealocacaoProps = RealocacaoProps & {
    setor: CODIGOSETOR,
}

export type RealocacaoComDepedenciaProps = HookRealocacaoProps & {
    realocacaoUltSetor: RealocacaoParcial
    itemContext: Item
}

export type RealocacaoSemDependenciaProps = HookRealocacaoProps & {
    itemContext: Item
}

export abstract class MetodoDeReAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta,
        protected Itemselecionador: ISelecionarItem
    ) { }

    protected abstract realocacao(
        props: RealocacaoSemDependenciaProps
    ): Promise<RealocacaoParcial>;

    protected abstract realocacaoComDepedencia(
        props: RealocacaoComDepedenciaProps
    ): Promise<RealocacaoParcial>;

    public async hookRealocacao(
        props: HookRealocacaoProps
    ): Promise<RealocacaoParcial> {
        
        const itemContext = this.Itemselecionador.seleciona(props.estrutura);

        if (!itemContext) throw new Error('Não foi selecionado nenhuma item');

        if (props.realocacaoUltSetor && (props.realocacaoUltSetor.adicionado.length || props.realocacaoUltSetor.retirado.length)) {
            return await this.realocacaoComDepedencia({
                ...props,
                itemContext,
                realocacaoUltSetor: props.realocacaoUltSetor || props.planFalho || []
            });
        }
        else {
            return await this.realocacao({
                ...props,
                itemContext,
            });
        }
    }
}