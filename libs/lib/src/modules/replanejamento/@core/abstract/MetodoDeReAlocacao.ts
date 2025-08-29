import { Calendario } from "@libs/lib/modules/shared/@core/classes/Calendario";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { RealocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/RealocacaoProps";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial";

export abstract class MetodoDeReAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta
    ) { }

    protected abstract realocacao(
        fabrica: Fabrica,
        setor: CODIGOSETOR,
        props: RealocacaoProps,
        verificacao: IVerificaCapacidade,
    ): Promise<RealocacaoParcial>;

    protected abstract realocacaoComDepedencia(
        fabrica: Fabrica,
        setor: CODIGOSETOR,
        props: RealocacaoProps,
        verificacao: IVerificaCapacidade,
        ultSetorPlan: RealocacaoParcial
    ): Promise<RealocacaoParcial>;

    public async hookRealocacao(
        fabrica: Fabrica,
        setor: CODIGOSETOR,
        props: RealocacaoProps,
        verificacao: IVerificaCapacidade,
        planDoUltimoSetor?: RealocacaoParcial
    ): Promise<RealocacaoParcial> {
        if (planDoUltimoSetor && (planDoUltimoSetor.adicionado.length || planDoUltimoSetor.retirado.length)) {
            return await this.realocacaoComDepedencia(fabrica, setor, props, verificacao, planDoUltimoSetor);
        }
        else {
            return await this.realocacao(fabrica, setor, props, verificacao);
        }
    }
}