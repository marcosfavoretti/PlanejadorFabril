import { Module } from "@nestjs/common";
import { IGerenciadorPlanejamentConsulta } from "../fabrica/@core/interfaces/IGerenciadorPlanejamentoConsulta";
import { IGerenciadorPlanejamentoMutation } from "../fabrica/@core/interfaces/IGerenciadorPlanejamento";
import { TabelaProducaoRepository } from "./infra/repositories/TabelaProducao.repository";
import { PlanejamentoRepository } from "./infra/repositories/Planejamento.repo";
import { TabelaProducaoService } from "./infra/services/TabelaProducao.service";
import { PlanejamentoService } from "./infra/services/Planejamento.service";

@Module({
    imports: [],
    providers: [
        PlanejamentoRepository,
        TabelaProducaoRepository,
        TabelaProducaoService,
        PlanejamentoService
    ],
    exports: [
        PlanejamentoService,
        PlanejamentoRepository,
        TabelaProducaoService,
        TabelaProducaoRepository,
    ]
})
export class PlanejamentoServiceModule { }