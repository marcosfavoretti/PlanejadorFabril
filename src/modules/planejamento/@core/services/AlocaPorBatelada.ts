import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { IGerenciadorPlanejamentConsulta } from "src/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { Inject } from "@nestjs/common";
import { VerificaBatelada } from "src/modules/fabrica/@core/classes/VerificaBatelada";
import { IVerificaCapacidade } from "src/modules/fabrica/@core/interfaces/IVerificaCapacidade";

export class AlocaPorBatelada extends MetodoDeAlocacao {
    private readonly BATELADASMAX!: number;

    constructor(
        @Inject(IGerenciadorPlanejamentConsulta) gerenciador: IGerenciadorPlanejamentConsulta,
    ) {
        const bateladas_max = Number(process.env.BATELADAMAX)
        super(
            gerenciador
        );
        this.BATELADASMAX = bateladas_max;
    }

    private ordenaPorMaisNovo(): (a, b) => number {
        return (a, b) => b - a;
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaBatelada(this.BATELADASMAX);
    }

    //para tirar isso deveria aplicar interfaces de maneira mais inteligente. E nao template pattern.:.refatoração
    protected async alocacao(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]> {
        throw new Error('NOT_IMPLEMENTED');
    }

    protected diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        throw new Error('NOT_IMPLEMENTED');
    }
    //
    
    protected async alocacaoComDependencia(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR, planejamentoProximoSetor: PlanejamentoTemporario[]): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = pedido.getItem().getLeadtime(setor);
        const planejamentosProxOrdenados = planejamentoProximoSetor.sort(this.ordenaPorMaisNovo());
        let restante = pedido.getLote();
        let jaAlocados: number = 0;

        for (const necessidade of planejamentosProxOrdenados) {
            if (restante <= 0) break;

            const precisoAlocar = necessidade.qtd;//planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            let dataLimite = leadtime > 0 ? this.calendario.ultimoDiaUtil(
                this.calendario.subDays(necessidade.dia, leadtime),
                true
            ) : necessidade.dia;

            const datasParaProgramar = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                fabrica, dataLimite, setor, pedido.item, precisoAlocar, new VerificaBatelada(this.BATELADASMAX), planejamentosTemporarios
            );

            console.log(`datas para suprir ${datasParaProgramar}`)
            const qtdMatriz: number[] = [];

            for (const data of datasParaProgramar) {
                const response = await this.gerenciadorPlan.possoAlocarQuantoNoDia(fabrica, data, setor, pedido.item, new VerificaBatelada(this.BATELADASMAX), planejamentosTemporarios);
                qtdMatriz.push(response);
            }

            for (const [index, data] of datasParaProgramar.entries()) {
                const possoAlocarNesseDia = qtdMatriz[index];
                const qtdParaAlocar = Math.min(
                    restante,
                    necessidade.qtd,
                    possoAlocarNesseDia,
                );
                if (qtdParaAlocar <= 0) continue;
                planejamentosTemporarios.push({
                    dia: data,
                    item: pedido.item,
                    pedido,
                    qtd: qtdParaAlocar,
                    setor: setor,
                });
                restante -= qtdParaAlocar;
                jaAlocados += qtdParaAlocar;
                if (restante <= 0) break; // encerramento antecipado
            }
        }
        return planejamentosTemporarios;
    }

}