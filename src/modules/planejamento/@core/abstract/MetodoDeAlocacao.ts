import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { Pedido } from "../../../pedido/@core/entities/Pedido.entity";
import { IGerenciadorPlanejamentConsulta } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { IVerificaCapacidade } from "src/modules/fabrica/@core/interfaces/IVerificaCapacidade";

export abstract class MetodoDeAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta,
    ) {
    }

    protected abstract diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]>;

    protected abstract alocacao(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]>;

    protected abstract alocacaoComDependencia(
        fabrica: Fabrica,
        pedido: Pedido,
        setor: CODIGOSETOR,
        planejamentoProximoSetor: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]>;

    public async hookAlocacao(
        fabrica: Fabrica,
        pedido: Pedido,
        setor: CODIGOSETOR,
        planDoProximoSetor?: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]> {
        const planejamento: PlanejamentoTemporario[] = [];
        if (planDoProximoSetor && planDoProximoSetor.length) {
            const alocacao = await this.alocacaoComDependencia(fabrica, pedido, setor, planDoProximoSetor);
            planejamento.push(...alocacao);
        }
        else {
            const diasDoSetor = await this.diasPossiveis(fabrica, pedido, setor);
            const alocacao = await this.alocacao(fabrica, pedido, setor, diasDoSetor);
            planejamento.push(...alocacao);
        }
        return planejamento
    }

    abstract verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade
}
