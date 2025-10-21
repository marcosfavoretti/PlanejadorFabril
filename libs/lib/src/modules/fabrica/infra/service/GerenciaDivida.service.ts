import { Inject } from "@nestjs/common";
import { DividaService } from "./Divida.service";
import { Divida } from "../../@core/entities/Divida.entity";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { CalculaDividaDoPlanejamentoProps, ICalculoDivida } from "../../@core/interfaces/ICalculoDivida";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";
import { ISetStrategy } from "../../@core/interfaces/IStrategySet";
import { DividaBuilder } from "../../@core/builder/Divida.builder";

export class GerenciaDividaService
    implements ISetStrategy<ICalculoDivida> {

    constructor(
        @Inject(DividaService) private dividaService: DividaService,
        @Inject(ICalculoDivida) private calculoDivida: ICalculoDivida
    ) { }

    setStrategy(strategy: ICalculoDivida): void {
        this.calculoDivida = strategy;
    }

    async apagarDividas(fabrica: Fabrica, pedido: Pedido): Promise<void> {
        await this.dividaService.removerDividaNaFabricaDoPedido(fabrica, pedido);
    }


    async adicionaDividas(fabrica: Fabrica, dividas: Divida[]): Promise<void> {
        //TODO improve: melhor tirar ou juntar esse metodo com o resolver divida
        return await this.dividaService.addDivida(fabrica, dividas, SnapShotEstados.base, 'calculo');
    }

    /**
    * @param fabrica 
    * @param pedido 
    * @param estrategia
    * @description Metodo que com base na estrategia vai ver se precisa incrementar ou decrementar a divida. Caso for preciso alguma ação ele ja chamara o metodo do repositorio 
    * @returns 
    */
    async resolverDividas(props: CalculaDividaDoPlanejamentoProps): Promise<Divida[]> {//esse metodo logo nao podera mais executar a interface dentro dele
        try {
            // TODO IMPROVE: para tentar deixar menos custoso isso
            const dividas = (await this.calculoDivida.calc(props))
                .filter(divida => divida.qtd > 0);

            await this.dividaService.removerDividaNaFabricaDoPedido(props.fabrica, props.pedido);

            const dividasParaAlterar: Divida[] = [];

            dividas.forEach(divida =>
                dividasParaAlterar.push(
                    new DividaBuilder()
                        .item(divida.item)
                        .pedido(divida.pedido)
                        .qtd(divida.qtd)
                        .setor(divida.setor.codigo)
                        .build())
            );

            return dividasParaAlterar;

        } catch (error) {
            console.error(error)
            throw new Error(`Não foi possível criar a dívida! ${error.message}`);
        }
    }
}