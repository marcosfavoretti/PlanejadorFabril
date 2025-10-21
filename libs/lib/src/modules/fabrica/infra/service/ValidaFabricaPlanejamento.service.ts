import { Inject, Logger } from "@nestjs/common";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { IValidaFabrica } from "../../@core/interfaces/IValidaFabrica";
import { BuscaPedidosService } from "./BuscaPedidos.service";
import { ConsultaPlanejamentoService } from "./ConsultaPlanejamentos.service";
import { PlanejamentoOverWriteByPedidoService } from "../../@core/services/PlanejamentoOverWriteByPedido.service";
import { PlanejamentoSnapShot } from "../../@core/entities/PlanejamentoSnapShot.entity";
import { FabricaPlanejadaErradaException } from "../../@core/exception/FabricaPlanejadaErrada.exception";
import { ICalculoDivida } from "../../@core/interfaces/ICalculoDivida";
import { PlanejamentoTemporario } from "@libs/lib/modules/planejamento/@core/classes/PlanejamentoTemporario";

export class ValidaFabricaPlanejamento
    implements IValidaFabrica {

    @Inject(BuscaPedidosService) private buscarPedido: BuscaPedidosService;
    @Inject(ICalculoDivida) private calculoDivida: ICalculoDivida;
    @Inject(ConsultaPlanejamentoService) private consultaPlanejamentoService: ConsultaPlanejamentoService;

    async valide(fabrica: Fabrica): Promise<void> {
        const map = new Map<number, PlanejamentoSnapShot[]>();
        const pedidosDaFabrica = await this.buscarPedido.pedidosNaFabrica(fabrica);
        const planejamentosDoPedido = await this.consultaPlanejamentoService.consultaPorPedido(fabrica, [...pedidosDaFabrica], new PlanejamentoOverWriteByPedidoService());

        planejamentosDoPedido.forEach(plan => {
            const planTarget = plan.planejamento.pedido.id;
            if (!map.has(planTarget)) {
                map.set(planTarget, []);
            }
            map.get(planTarget)?.push(plan);
        })

        for (const pedido of pedidosDaFabrica) {
            Logger.log(`Validando planejamento para o pedido: ${pedido.id}`);
            const planejamentoDoPedido = map.get(pedido.id);

            if (!planejamentoDoPedido) {
                // Se não houver nenhum planejamento, a dívida será o lote inteiro.
                // Isso já é uma discrepância.
                Logger.warn(`Nenhum planejamento encontrado para o pedido ${pedido.id}`);
            }

            const dividas = (await this.calculoDivida.calc({
                fabrica,
                pedido,
                planejamentos: planejamentoDoPedido?.map(PlanejamentoTemporario.createByEntity) ?? [] // Garante que seja um array vazio se não houver planejamento
            }));

            if (dividas.length > 0) {
                // Constrói um mapa mais descritivo para a exceção
                const discrepancias = new Map(dividas.map((divida) => [
                    `${divida.item.Item};${divida.setor.codigo}`, // Chave: "CODIGO_ITEM-CODIGO_SETOR"
                    divida.qtd // Valor: A diferença calculada (positiva se falta, negativa se sobra)
                ]));
                throw new FabricaPlanejadaErradaException(fabrica, pedido, discrepancias);
            }
        }
    }
}