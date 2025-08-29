import { SetorBanho } from "../planejamento/@core/services/SetorBanho";
import { SetorSolda } from "../planejamento/@core/services/SetorSolda";
import { SetorLixa } from "../planejamento/@core/services/SetorLixa";
import { SetorMontagem } from "../planejamento/@core/services/SetorMontagem";
import { SetorPinturaLiq } from "../planejamento/@core/services/SetorPinturaliq";
import { MetodoDeAlocacao } from "../planejamento/@core/abstract/MetodoDeAlocacao";
import { MetodoDeReAlocacao } from "../replanejamento/@core/abstract/MetodoDeReAlocacao";
import { AlocaPorCapabilidade } from "../planejamento/@core/services/AlocaPorCapabilidade";
import { RealocaPorCapabilidade } from "../replanejamento/@core/service/RealocaPorCapabilidade";
import { AlocaPorBatelada } from "../planejamento/@core/services/AlocaPorBatelada";
import { Provider } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "./@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { SelecionaItem000 } from "./@core/classes/SelecionaItem000";
import { GerenciadorPlanejamento } from "./infra/service/GerenciadorPlanejamento";
import { SelecionaItemRops } from "./@core/classes/SelecionaItemRops";
import { AlocaItensDependencias } from "../planejamento/@core/services/AlocaItensDependencias";
import { SetorPinturaPo } from "../planejamento/@core/services/SetorPinturaPo";
import { AlocaPorPinturaBatelada } from "../planejamento/@core/services/AlocaPorPinturaBatelada";

export const SetorFabricaProviders: Provider[] = [
    {
        provide: IGerenciadorPlanejamentConsulta,
        useClass: GerenciadorPlanejamento
    },
    {
        provide: 'AlocaCapabilidadeMontagem',
        useFactory: (g: IGerenciadorPlanejamentConsulta) => new AlocaPorCapabilidade(g, new SelecionaItem000()),
        inject: [IGerenciadorPlanejamentConsulta]
    },
    {
        provide: 'AlocaCapabilidadeRops',
        useFactory: (g: IGerenciadorPlanejamentConsulta) => new AlocaPorCapabilidade(g, new SelecionaItemRops()),
        inject: [IGerenciadorPlanejamentConsulta]
    },
    {
        provide: 'AlocaPorPinutraRops',
        useFactory: (g: IGerenciadorPlanejamentConsulta) => new AlocaPorPinturaBatelada(g, new SelecionaItemRops()),
        inject: [IGerenciadorPlanejamentConsulta]
    },
    {
        provide: 'AlocaPorBateladaRops',
        useFactory: (g: IGerenciadorPlanejamentConsulta) => new AlocaPorBatelada(g, new SelecionaItemRops()),
        inject: [IGerenciadorPlanejamentConsulta]
    },
    AlocaItensDependencias,
    {
        provide: SetorLixa,
        useFactory: (
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorLixa(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaCapabilidadeRops', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorSolda,
        useFactory: (
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorSolda(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaCapabilidadeRops', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorPinturaPo,
        useFactory: (
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorPinturaPo(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaCapabilidadeRops', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorBanho,
        useFactory: (
            metodoDeAlocacao: AlocaPorBatelada,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorBanho(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaPorBateladaRops', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorPinturaLiq,
        useFactory: (
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorPinturaLiq(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaPorPinutraRops', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
    {
        provide: SetorMontagem,
        useFactory: (
            metodoDeAlocacao: MetodoDeAlocacao,
            metodoDeReAlocacao: MetodoDeReAlocacao,
        ) => {
            return new SetorMontagem(
                metodoDeAlocacao,
                metodoDeReAlocacao,
            );
        },
        inject: ['AlocaCapabilidadeMontagem', RealocaPorCapabilidade], // Adicione aqui os providers que você quer injetar como dependências
    },
];
