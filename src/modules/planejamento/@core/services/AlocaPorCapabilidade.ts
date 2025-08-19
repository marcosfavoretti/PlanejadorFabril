import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
import { CODIGOSETOR } from "../enum/CodigoSetor.enum";
import { Inject } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "../../../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { PlanejamentoTemporario } from "../classes/PlanejamentoTemporario";
import { Fabrica } from "src/modules/fabrica/@core/entities/Fabrica.entity";
import { Pedido } from "src/modules/pedido/@core/entities/Pedido.entity";
import { VerificaCapabilidade } from "src/modules/fabrica/@core/classes/VerificaCapabilidade";
import { IVerificaCapacidade } from "src/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { SetorService } from "../abstract/SetorService";

export class AlocaPorCapabilidade extends MetodoDeAlocacao {

    constructor(
        @Inject(IGerenciadorPlanejamentConsulta) gerenciador: IGerenciadorPlanejamentConsulta,
    ) {
        super(gerenciador);
    }

    verificacaoCapacidade(pedido: Pedido, codigoSetor: CODIGOSETOR): IVerificaCapacidade {
        return new VerificaCapabilidade(pedido.item, codigoSetor);
    }

    protected async diasPossiveis(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR): Promise<Date[]> {
        try {
            const dias = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                fabrica,
                pedido.getSafeDate(),
                setor,
                pedido.item,
                pedido.lote,
                new VerificaCapabilidade(pedido.item, setor)
            );
            return dias;
        } catch (error) {
            console.error(error);
            throw new Error(`Problema a consultar as datas para adiantar a producao\n${error}`)
        }
    }

    private sortStrategy(): (a, b) => number {
        return (a, b) => b - a;
    }

    protected async alocacaoComDependencia(
        fabrica: Fabrica,
        pedido: Pedido,
        setor: CODIGOSETOR,
        planejamentoProximoSetor: PlanejamentoTemporario[]
    ): Promise<PlanejamentoTemporario[]> {
        const planejamentosTemporarios: PlanejamentoTemporario[] = [];
        const leadtime = pedido.getItem().getLeadtime(setor);
        const planejamentosProxOrdenados = planejamentoProximoSetor.sort(this.sortStrategy());
        let restante = pedido.getLote();
        for (const necessidade of planejamentosProxOrdenados) {
            if (restante <= 0) break;

            const precisoAlocar = necessidade.qtd;
            //planejamentoProximoSetor.reduce((total, plan) => total += plan.qtd, 0);

            let dataLimite = leadtime > 0 ? this.calendario.ultimoDiaUtil(
                this.calendario.subDays(necessidade.dia, leadtime),
                true
            ) : necessidade.dia;

            const datas = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                fabrica, dataLimite, setor, pedido.item, precisoAlocar, new VerificaCapabilidade(pedido.item, setor), planejamentosTemporarios
            );

            const qtdMatriz: number[] = [];

            for (const data of datas) {
                const response = await this.gerenciadorPlan.possoAlocarQuantoNoDia(fabrica, data, setor, pedido.item, new VerificaCapabilidade(pedido.item, setor), planejamentosTemporarios);
                qtdMatriz.push(response);
            }

            for (const [index, data] of datas.entries()) {
                const possoAlocarNesseDia = qtdMatriz[index];
                const qtdParaAlocar = Math.min(
                    restante,
                    possoAlocarNesseDia,
                    pedido.item.capabilidade(setor)
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
                if (restante <= 0) break; // encerramento antecipado
            }
        }
        return planejamentosTemporarios;
    }

    protected async alocacao(fabrica: Fabrica, pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoTemporario[]> {
        try {
            const planejamentosDoPedido: PlanejamentoTemporario[] = [];
            let restante = pedido.getLote();
            let i = 0;
            dias.sort((a, b) => b.getTime() - a.getTime());
            while (restante > 0 && i < dias.length) {
                let dia = dias[i];

                let capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(fabrica, dia, setor, pedido.item, new VerificaCapabilidade(pedido.item, setor), planejamentosDoPedido);

                if (capacidadeRestante <= 0) {
                    const [primeiroDiaComEncaixe, ...outrosDiasComEncaixe] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(fabrica, dia, setor, pedido.item, restante, new VerificaCapabilidade(pedido.item, setor), planejamentosDoPedido);
                    dias.push(...outrosDiasComEncaixe);
                    dia = primeiroDiaComEncaixe;
                    capacidadeRestante = await this.gerenciadorPlan.possoAlocarQuantoNoDia(fabrica, dia, setor, pedido.item, new VerificaCapabilidade(pedido.item, setor), planejamentosDoPedido);
                }

                const quantidadeParaAlocar = Math.min(restante, capacidadeRestante);

                planejamentosDoPedido.push({
                    dia: dia,
                    item: pedido.item,
                    pedido: pedido,
                    qtd: quantidadeParaAlocar,
                    setor: setor
                });

                restante -= quantidadeParaAlocar;

                if (restante > 0 && i === dias.length - 1) {
                    const [novaData] = await this.gerenciadorPlan.diaParaAdiantarProducaoEncaixe(
                        fabrica,
                        this.calendario.subDays(dia, 1),
                        setor,
                        pedido.item,
                        restante,
                        new VerificaCapabilidade(pedido.item, setor),
                        planejamentosDoPedido
                    );
                    dias.push(novaData);
                }
                i++;
            }
            console.log('terminei alocacao')
            return planejamentosDoPedido;
        } catch (error) {
            console.error(error);
            throw new Error(`Erro ao alocar carga do pedido ${pedido.codigo}`);
        }
    }
}  