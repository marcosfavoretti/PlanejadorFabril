// import { min } from "date-fns";
// import { MetodoDeAlocacao } from "../abstract/MetodoDeAlocacao";
// import type { IGerenciadorPlanejamento } from "../interfaces/IGerenciadorPlanejamento";
// import type { Pedido } from "../entities/Pedido.entity";
// import { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";
// import { CODIGOSETOR } from "../enum/CodigoSetor.enum";

// export class AlocaPorMedia extends MetodoDeAlocacao {
//     folga: number = Number(process.env.ALOCACAO_MEDIA_FOLGA);

//     constructor(gerenciador: IGerenciadorPlanejamento) {
//         super(gerenciador);
//     }

//     protected diasPossiveis(pedido: Pedido, setor: CODIGOSETOR, diasBase?: Date[]): Date[] {
//         const capabilidadeSafe = Math.ceil(pedido.getItem().produzaPc(setor) * (1 - this.folga));
//         const qtdDiasParaMediaAlvo = Math.ceil(pedido.getLote() / capabilidadeSafe);
//         if (diasBase && diasBase.length > 1) {
//             //caso ele esteja no backpropagation
//             diasBase = diasBase.map(d =>
//                 this.calendario.ultimoDiaUtil(
//                     this.calendario.subDays(
//                         d, pedido.getItem().getLeadtime(setor))
//                     ,
//                     true
//                 )
//             )
//             const qtdDiasInit = diasBase.length
//             const mediaDiaAtual = pedido.getLote() / diasBase.length;
//             if (mediaDiaAtual > capabilidadeSafe) {
//                 while (diasBase.length < Math.floor(qtdDiasParaMediaAlvo) + qtdDiasInit) {
//                     diasBase.push(this.calendario.ultimoDiaUtil(min(diasBase), true));
//                     console.log('tive que criar mais um dia para arrumar a media', min(diasBase))
//                 }
//             }
//             return diasBase;
//         }
//         const diasDisponiveis = this.calendario.diasPossiveis(pedido.getSafeDate(), qtdDiasParaMediaAlvo);
//         return diasDisponiveis;
//     }


//     protected async alocacao(pedido: Pedido, setor: CODIGOSETOR, dias: Date[]): Promise<PlanejamentoDiario[]> {
//         try {
//             const mediaDia = pedido.getLote() / dias.length;
//             const planejamentosDoPedido: PlanejamentoDiario[] = [];
//             let restante = pedido.getLote();
//             let i: number = 0;
//             while (restante > 0 && i < dias.length) {
//                 let dia = dias[i];
//                 const capabilidadeSafe = Math.ceil(pedido.getItem().produzaPc(setor) * (1 - this.folga));
//                 const quantidade = Math.min(Math.floor(mediaDia), capabilidadeSafe, restante);
//                 let dataAlocacao = dia;
//                 if (!(await this.gerenciadorPlan.possoAlocarNoDia(dia, setor, pedido.item, quantidade))) {
//                     dataAlocacao = await this.gerenciadorPlan.diaParaAdiantarProducao(dataAlocacao, setor, pedido.item, quantidade);
//                 }
//                 const planejadoSalvo = await this.gerenciadorPlan.addPlanejamento(pedido, pedido.item, quantidade, setor, dia);

//                 restante -= quantidade;
//                 const planejamentoDiario = await this.gerenciadorPlan.addPlanejamento(pedido, pedido.item, quantidade, setor, dia);
//                 planejamentosDoPedido.push(planejamentoDiario);
//                 if (restante > 0 && i === dias.length - 1) {
//                     const novaData = await this.gerenciadorPlan.diaParaAdiantarProducao(this.calendario.subDays(dataAlocacao, 1), setor, pedido.item, quantidade);
//                     dias.push(novaData);
//                 }
//                 i++;
//             }
//             return planejamentosDoPedido;
//         } catch (error) {
//             console.error(error);
//             throw new Error('problema ao alocar por média')
//         }
//     }
// }
