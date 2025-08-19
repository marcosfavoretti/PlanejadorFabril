import { SetorBanho } from "../planejamento/@core/services/SetorBanho";
import { SetorSolda } from "../planejamento/@core/services/SetorSolda";
import { SetorLixa } from "../planejamento/@core/services/SetorLixa";
import { SetorMontagem } from "../planejamento/@core/services/SetorMontagem";
import { SetorPinturaLiq } from "../planejamento/@core/services/SetorPinturaliq";
import { ISyncProducao } from "../planejamento/@core/interfaces/ISyncProducao";
import { IGerenciadorPlanejamentoMutation } from "./@core/interfaces/IGerenciadorPlanejamento";
import { MetodoDeAlocacao } from "../planejamento/@core/abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "../replanejamento/@core/abstract/MetodoDeReAlocacao";
import { ISyncProducaoFalha } from "../planejamento/@core/interfaces/ISyncProducaoFalha";
import { AlocaPorCapabilidade } from "../planejamento/@core/services/AlocaPorCapabilidade";
import { RealocaPorCapabilidade } from "../replanejamento/@core/service/RealocaPorCapabilidade";
import { AlocaPorBatelada } from "../planejamento/@core/services/AlocaPorBatelada";

export const SetorFabricaProviders = [
    {
        provide: SetorLixa,
        useFactory: (
            syncProducaoFalha: ISyncProducao & ISyncProducaoFalha,
            iGerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao
        ) => {
            return new SetorLixa(
                syncProducaoFalha,
                iGerenciadorPlanejamentoMutation,
                metodoDeAlocacao,
                metodoDeReAlocacao
            );
        },
        inject: [ISyncProducao, IGerenciadorPlanejamentoMutation, AlocaPorCapabilidade, RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorSolda,
        useFactory: (
            syncProducaoFalha: ISyncProducao & ISyncProducaoFalha,
            iGerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao
        ) => {
            return new SetorSolda(
                syncProducaoFalha,
                iGerenciadorPlanejamentoMutation,
                metodoDeAlocacao,
                metodoDeReAlocacao
            );
        },
        inject: [ISyncProducao, IGerenciadorPlanejamentoMutation, AlocaPorCapabilidade, RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorBanho,
        useFactory: (
            syncProducaoFalha: ISyncProducao & ISyncProducaoFalha,
            iGerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
            metodoDeAlocacao: AlocaPorBatelada,
            metodoDeReAlocacao: MetodoDeReAlocacao
        ) => {
            return new SetorBanho(
                syncProducaoFalha,
                iGerenciadorPlanejamentoMutation,
                metodoDeAlocacao,
                metodoDeReAlocacao
            );
        },
        inject: [ISyncProducao, IGerenciadorPlanejamentoMutation, AlocaPorBatelada, RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorPinturaLiq,
        useFactory: (
            syncProducaoFalha: ISyncProducao & ISyncProducaoFalha,
            iGerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao
        ) => {
            return new SetorPinturaLiq(
                syncProducaoFalha,
                iGerenciadorPlanejamentoMutation,
                metodoDeAlocacao,
                metodoDeReAlocacao
            );
        },
        inject: [ISyncProducao, IGerenciadorPlanejamentoMutation, AlocaPorCapabilidade, RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorMontagem,
        useFactory: (
            syncProducaoFalha: ISyncProducao & ISyncProducaoFalha,
            iGerenciadorPlanejamentoMutation: IGerenciadorPlanejamentoMutation,
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao
        ) => {
            return new SetorMontagem(
                syncProducaoFalha,
                iGerenciadorPlanejamentoMutation,
                metodoDeAlocacao,
                metodoDeReAlocacao
            );
        },
        inject: [ISyncProducao, IGerenciadorPlanejamentoMutation, AlocaPorCapabilidade, RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
];
