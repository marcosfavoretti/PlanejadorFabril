import { MetodoDeReAlocacao } from "../abstract/MetodoDeReAlocacao";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";
import { RealocacaoProps } from "@libs/lib/modules/fabrica/@core/classes/RealocacaoProps";
import { Fabrica } from "@libs/lib/modules/fabrica/@core/entities/Fabrica.entity";
import { Inject, Logger } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "@libs/lib/modules/fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { ConsultaPlanejamentoService } from "@libs/lib/modules/fabrica/infra/service/ConsultaPlanejamentos.service";
import { addBusinessDays, differenceInBusinessDays, isAfter, isBefore } from "date-fns";
import { IVerificaCapacidade } from "@libs/lib/modules/fabrica/@core/interfaces/IVerificaCapacidade";
import { RealocacaoParcial } from "@libs/lib/modules/planejamento/@core/classes/RealocacaoParcial";

export class RealocaPorCapabilidade extends MetodoDeReAlocacao {

    constructor(
        @Inject(ConsultaPlanejamentoService) private consulta: ConsultaPlanejamentoService,
        @Inject(IGerenciadorPlanejamentConsulta) gerenciador: IGerenciadorPlanejamentConsulta,
    ) {
        super(gerenciador);
    }

    logger = new Logger();

    private planejamentosDoSetor(planejamentosDoPedido: PlanejamentoTemporario[], dataEstopim: Date, setor: CODIGOSETOR): PlanejamentoTemporario[] {
        return planejamentosDoPedido
            .filter(p => p.setor === setor && isAfter(p.dia, dataEstopim))
            .sort((a, b) => a.dia.getTime() - b.dia.getTime());
    }

    private calcOffSet(planejamentos: PlanejamentoTemporario[], dataEstopim: Date): number[] {
        return planejamentos.map(plan =>
            differenceInBusinessDays(plan.dia, dataEstopim)
        );
    }

    protected async realocacao(
        fabrica: Fabrica,
        setor: CODIGOSETOR,
        props: RealocacaoProps,
        verificacao: IVerificaCapacidade,
    ): Promise<RealocacaoParcial> {

        this.logger.log('REALOCACAO NORMAL INIT');

        const resultado: RealocacaoParcial = new RealocacaoParcial();

        const dataEstopim = props.planejamentoFalho.dia;

        console.log(dataEstopim);

        console.log(props.planejamentoPedido)

        //pega dos planejados oq é depois da data de estopim e esta no setor corrente
        const planejamentosImpactadoDoSetorASC = this.planejamentosDoSetor(
            props.planejamentoPedido,
            dataEstopim,
            setor
        );

        setor === props.planejamentoFalho.setor && planejamentosImpactadoDoSetorASC.unshift(props.planejamentoFalho);

        console.log(planejamentosImpactadoDoSetorASC.map(s => s.setor));

        const offsetsRelativos = this.calcOffSet(planejamentosImpactadoDoSetorASC, dataEstopim);

        console.log(`offset ${setor}:`, offsetsRelativos);

        let totalParaRealocar = props.planejamentoFalho.qtd;

        for (const [index, planejamento] of planejamentosImpactadoDoSetorASC.entries()) {

            if (totalParaRealocar <= 0) {
                console.log(`✅ Setor ${setor} finalizado. Pulando para o próximo da chain...`);
                break; // passa para o próximo setor na chain
            }

            const offset = offsetsRelativos[index];

            console.log(offset)

            let novaData = addBusinessDays(props.novaData, offset);

            const capacidade = await this.gerenciadorPlan.possoAlocarQuantoNoDia(
                fabrica,
                novaData,
                setor,
                planejamento.item,
                verificacao,
            );

            let qtdAlocada = Math.min(totalParaRealocar, capacidade);

            if (capacidade <= 0) {
                novaData = this.calendario.proximoDiaUtilReplanejamento(novaData);
                qtdAlocada = Math.min(totalParaRealocar, capacidade);
            }

            const objetoAdicionado: PlanejamentoTemporario = {
                ...planejamento,
                planejamentoSnapShotId: undefined,
                dia: novaData,
                qtd: qtdAlocada,
            };

            resultado.retirado.push(planejamento);
            resultado.adicionado.push(objetoAdicionado);

            totalParaRealocar -= qtdAlocada;
        }


        console.log(resultado)
        
        this.logger.log('REALOCACAO NORMAL INIT')
        return resultado;
    }

    protected async realocacaoComDepedencia(
        fabrica: Fabrica,
        setor: CODIGOSETOR,
        props: RealocacaoProps,
        verificacao: IVerificaCapacidade,
        ultSetorPlan: RealocacaoParcial
    ): Promise<RealocacaoParcial> {
        this.logger.log('REALOCACAO COM DEPENDENCIA INIT')

        console.log('aqui');

        const resultado = new RealocacaoParcial();

        const dataEstopim = props.planejamentoFalho.dia;

        // 1️⃣ Pega o planejamento original desse setor
        const planejamentosOriginaisASC = this.planejamentosDoSetor(
            props.planejamentoPedido,
            dataEstopim,
            setor
        );

        const offsetsRelativos = this.calcOffSet(
            planejamentosOriginaisASC,
            dataEstopim
        )

        console.log('offset:', offsetsRelativos);

        // 2️⃣ Quantidades que chegam do setor anterior
        let quantidadeRestante = ultSetorPlan.adicionado
            .reduce((soma, p) => soma + p.qtd, 0);

        // 3️⃣ Itera sobre o planejamento original
        for (const [index, planejamentoOriginal] of planejamentosOriginaisASC.entries()) {
            if (quantidadeRestante <= 0) {
                console.log(`✅ Setor ${setor} não precisa realocar mais nada.`);
                break;
            }

            const offset = offsetsRelativos[index];
            let novaData = addBusinessDays(props.novaData, offset);

            const capacidade = await this.gerenciadorPlan.possoAlocarQuantoNoDia(
                fabrica,
                novaData,
                setor,
                planejamentoOriginal.item,
                verificacao,
            );

            if (capacidade <= 0) {
                novaData = this.calendario.proximoDiaUtilReplanejamento(novaData);
            }

            const qtdAlocada = Math.min(quantidadeRestante, capacidade);
            const sobra = quantidadeRestante - qtdAlocada;

            // Marca original como retirado
            resultado.retirado.push(planejamentoOriginal);

            // Adiciona novo planejamento realocado
            resultado.adicionado.push({
                ...planejamentoOriginal,
                dia: novaData,
                planejamentoSnapShotId: undefined,
                qtd: qtdAlocada,
            });

            quantidadeRestante = sobra;

            // Se sobrou, joga para próximo dia
            if (sobra > 0) {
                const proximoDia = this.calendario.proximoDiaUtilReplanejamento(novaData);
                resultado.adicionado.push({
                    ...planejamentoOriginal,
                    dia: proximoDia,
                    qtd: sobra,
                });
            } else {
                console.log(`✅ Setor ${setor} conseguiu processar tudo em ${novaData}`);
                break;
            }
        }
        this.logger.log('REALOCACAO COM DEPENDENCIA INIT')
        return resultado;
    }


}