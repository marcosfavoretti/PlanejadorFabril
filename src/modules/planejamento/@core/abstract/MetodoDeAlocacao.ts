import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { Pedido } from "../entities/Pedido.entity";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentConsulta } from "../interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { AlocacaoInvalidaException } from "../../exception/AlocacaoInvalida.exception";
import { Logger } from "@nestjs/common";

export abstract class MetodoDeAlocacao {
    protected calendario: Calendario = new Calendario();

    constructor(
        protected gerenciadorPlan: IGerenciadorPlanejamentConsulta,
    ) {
    }

    protected async diasPossiveis(pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        try {
            const dias = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                pedido.getSafeDate(),
                setor,
                pedido.item,
                pedido.lote
            )
            console.log(`dias para fazer a ${setor} ${pedido.codigo}`, dias);
            return dias;

        } catch (error) {
            console.error(error);
            throw new Error(`Problema a consultar as datas para adiantar a producao\n${error}`)
        }
    }

    protected abstract alocacao(pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]>;

    protected abstract alocacaoComDependencia(
        pedido: Pedido,
        setor: CODIGOSETOR,
        planejamentoProximoSetor: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]>;


    public async hookAlocacao(
        pedido: Pedido,
        setor: CODIGOSETOR,
        planDoProximoSetor?: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]> {
        const planejamento: PlanejamentoTemporario[] = [];
        if (planDoProximoSetor && planDoProximoSetor.length) {
            const alocacao = await this.alocacaoComDependencia(pedido, setor, planDoProximoSetor);
            planejamento.push(...alocacao);
        }
        else {
            const diasDoSetor = await this.diasPossiveis(pedido, setor);
            const alocacao = await this.alocacao(pedido, setor, diasDoSetor);
            planejamento.push(...alocacao);
        }
        this.verificaCargaAlocada(pedido, planejamento);
        return planejamento
    }

    private verificaCargaAlocada(pedido: Pedido, planejamentosTemporarios: PlanejamentoTemporario[]): void {
        console.log(planejamentosTemporarios)
        const quantidadeAlocada = planejamentosTemporarios.reduce((total, p) => total += p.qtd, 0);
        const error = quantidadeAlocada !== pedido.lote && new AlocacaoInvalidaException(`Quantidade alocada divergente prevista ${pedido.lote} alocada ${quantidadeAlocada}`);
        if (error) throw error;
    }
}
