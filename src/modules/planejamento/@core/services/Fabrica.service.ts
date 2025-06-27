import { Inject } from "@nestjs/common";
import { SetorService } from "../abstract/SetorService";
import { Pedido } from "../entities/Pedido.entity";
import { VirtualDateService } from "src/modules/producao-simulacao/infra/services/VirtualDate.service";
import { Mercado } from "../classes/Mercado";
import { MercadoLogStoreService } from "./MercadoLogStore.service";
import { GerenciadorPlanejamento } from "../entities/GerenciadorPlanejamento";
import { IGerenciadorPlanejamentoMutation } from "../interfaces/IGerenciadorPlanejamento";
import { PlanejamentoDiario } from "../entities/PlanejamentoDiario.entity";

export class FabricaService {
    constructor(
        @Inject(MercadoLogStoreService) private mercadoStore: MercadoLogStoreService,
        @Inject('PIPE_FABRICACAO') private pipeProducao: SetorService,
        @Inject(VirtualDateService) private readonly virtualDateService: VirtualDateService,
        @Inject(GerenciadorPlanejamento) private readonly gerenciadorPlanejamento: IGerenciadorPlanejamentoMutation
    ) {
    }

    printMercados(): Mercado[] {
        return this.pipeProducao.setoresSnapShot();
    }

    async planejamento(pedidos: Pedido[]): Promise<PlanejamentoDiario[]> {
        const planDiario: PlanejamentoDiario[] = [];
        try {
            for (const pedido of pedidos) {
                const {acumulado} = await this.pipeProducao.alocar(pedido);
                const result = await this.gerenciadorPlanejamento.appendPlanejamento(acumulado);
                planDiario.push(...result);
            }
            return planDiario;
        } catch (error) {
            console.error(error);
            throw new Error('problema ao salvar planejamentos temporarios');
        }
    }

    fork(): FabricaService {
        return this;
    }

    async replanejamento(): Promise<void> {
        const { virtualDate } = await this.virtualDateService.getVirtualDate();
        const mercadosSincronizados = await this.pipeProducao.syncMercado(virtualDate);
        console.log('-=-=-=-=-=')
        console.log(mercadosSincronizados, virtualDate);
        console.log('-=-=-=-=-=')
        //abaixo nao vai precisar mais pq ele vai ser responsabilidade do setor salvar os mercados
        this.mercadoStore.register(virtualDate, ...mercadosSincronizados);
        console.dir(this.mercadoStore.find(), { depth: 5 });
        // await this.pipeProducao.realocar(virtualDate);
    }
}