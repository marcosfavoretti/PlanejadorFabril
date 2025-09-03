import { Module } from "@nestjs/common";
import { GerenciaCargoService } from "./infra/service/GerenciaCargo.service";
import { CargoService } from "./infra/service/Cargo.service";
import { GerenciaCargoRepository } from "./infra/repository/GerenciaCargo.repository";
import { CargoRepository } from "./infra/repository/Cargo.repository";

@Module({
    imports: [],
    providers: [
        GerenciaCargoService,
        CargoService,
        GerenciaCargoRepository,
        CargoRepository
    ],
    exports: [
        GerenciaCargoService,
        CargoService,
        GerenciaCargoRepository,
        CargoRepository
    ]
})
export class CargosServiceModule { }