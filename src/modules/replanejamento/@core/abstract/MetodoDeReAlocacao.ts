import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { IGerenciadorPlanejamentConsulta } from "src/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { RealocacaoProps } from "src/modules/fabrica/@core/classes/RealocacaoProps";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { CODIGOSETOR } from "src/modules/planejamento/@core/enum/CodigoSetor.enum";
import { IVerificaCapacidade } from "src/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { RealocacaoParcial } from "src/modules/planejamento/@core/classes/RealocacaoParcial";

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