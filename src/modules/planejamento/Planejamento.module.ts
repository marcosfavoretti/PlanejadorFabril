import { Module } from "@nestjs/common";
import { GerenciadorPlanejamento } from "./@core/entities/GerenciadorPlanejamento";
import { PlanejamentoUseCase } from "./application/Planejamento.usecase";
import { PedidoRepository } from "./infra/repositories/Pedido.repo";
import { PlanejamentoRepository } from "./infra/repositories/Planejamento.repo";
import { PlanejamentoDiarioRepository } from "./infra/repositories/PlanejamentoDiario.repo";
import { TabelaProducaoRepository } from "../producao-simulacao/infra/repositories/TabelaProducao.repository";
import { ConsultarDatasPlanejadasUseCase } from "./application/ConsultarDatasPlanejadas.usecase";
import { FabricaModule } from "../fabrica/Fabrica.module";
import { IGerenciadorPlanejamentConsulta } from "./@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { IGerenciadorPlanejamentoMutation } from "./@core/interfaces/IGerenciadorPlanejamento";

@Module({
    imports: [
        FabricaModule
    ],
    providers: [
        {
            provide: IGerenciadorPlanejamentConsulta,
            useClass: GerenciadorPlanejamento
        },
        {
            provide: IGerenciadorPlanejamentoMutation,
            useClass: GerenciadorPlanejamento
        },
        TabelaProducaoRepository,
        PlanejamentoUseCase,
        PlanejamentoRepository,
        PlanejamentoDiarioRepository,
        ConsultarDatasPlanejadasUseCase,
        PedidoRepository
    ],
    exports: [
        ConsultarDatasPlanejadasUseCase,
        PlanejamentoUseCase,
    ]
})
export class PlanejamentoModule { }