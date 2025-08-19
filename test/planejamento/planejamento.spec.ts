import { Fabrica } from "src/modules/planejamento/@core/entities/Fabrica"
import { GerenciadorPlanejamento } from "src/modules/fabrica/infra/service/GerenciadorPlanejamento"
import { FabricaService } from "src/modules/fabrica/infra/service/FabricaSimulacao.service"
import { PedidosMemoRepo } from "src/modules/planejamento/infra/PedidosMemo.repo"

describe('teste da funcao de planejamento', () => {
    it('deve retornar um planjeamento de produção', () => {
        const repo = new PedidosMemoRepo();
        const fabrica = new FabricaService(new GerenciadorPlanejamento());
        const gerenciador = fabrica.planejamento(repo.find());
        gerenciador.display()
    })
})