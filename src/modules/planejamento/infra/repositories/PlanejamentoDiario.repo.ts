import { DataSource, Repository } from "typeorm";
import { PlanejamentoDiario } from "../../@core/entities/PlanejamentoDiario.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class PlanejamentoDiarioRepository extends Repository<PlanejamentoDiario>{
    constructor(
        @InjectDataSource() dt: DataSource
    ){
        super(PlanejamentoDiario, dt.createEntityManager());
    }
}