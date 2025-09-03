import { Inject } from "@nestjs/common";
import { DividaService } from "./Divida.service";
import { Divida } from "../../@core/entities/Divida.entity";
import { Fabrica } from "../../@core/entities/Fabrica.entity";
import { Pedido } from "@libs/lib/modules/pedido/@core/entities/Pedido.entity";
import { ICalculoDivida } from "../../@core/interfaces/ICalculoDivida";
import { CODIGOSETOR } from "@libs/lib/modules/planejamento/@core/enum/CodigoSetor.enum";
import { SnapShotEstados } from "../../@core/enum/SnapShotEstados.enum";

export class GerenciaDividaService {
    constructor(
        @Inject(DividaService) private dividaService: DividaService
    ) { }

    async apagarDividas(fabrica: Fabrica, pedido: Pedido): Promise<void> {
        await this.dividaService.removerDividaNaFabricaDoPedido(fabrica, pedido);
    }

    /**
    * @param fabrica 
    * @param pedido 
    * @param estrategia
    * @description Metodo que com base na estrategia vai ver se precisa incrementar ou decrementar a divida. Caso for preciso alguma ação ele ja chamara o metodo do repositorio 
    * @returns 
    */
    async resolverDividasParaSalvar(fabrica: Fabrica, pedido: Pedido, estrategia: ICalculoDivida): Promise<Divida[]> {//esse metodo logo nao podera mais executar a interface dentro dele
        try {
            const dividasCalculadas = await estrategia.calc();

            console.log('->', dividasCalculadas);

            const dividasTotalizadas = await this.dividaService.consultarDividaTotalizadaDoPedido(fabrica, pedido);

            const dividaBancoMap = new Map<CODIGOSETOR, number>();

            for (const { qtd, setorCodigo } of dividasTotalizadas) {
                dividaBancoMap.set(setorCodigo, qtd);
            }

            const dividasParaSalvar: Partial<Divida>[] = dividasCalculadas.map((dividaCalculada: Divida) => {
                const dividaBanco = dividaBancoMap.get(dividaCalculada.setor.codigo) ?? 0;
                console.log(dividaBanco, dividaCalculada.qtd)
                const qtdFinal = dividaCalculada.qtd + dividaBanco//< 0 ? dividaCalculada.qtd + dividaBanco : dividaCalculada.qtd - dividaBanco
                return {
                    ...dividaCalculada,
                    qtd: qtdFinal,
                    pedido,
                    fabrica,
                };
            });

            const dividasSnapShot = await this.dividaService.addDivida(
                fabrica, dividasParaSalvar, SnapShotEstados.base, 'calculo'
            );

            return dividasSnapShot.map(d => d.divida);

        } catch (error) {
            console.error(error)
            throw new Error(`Não foi possível criar a dívida! ${error.message}`);
        }
    }
}