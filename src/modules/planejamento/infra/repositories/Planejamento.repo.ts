import { DataSource, Repository } from "typeorm";
import { Planejamento } from "../../@core/entities/Planejamento.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class PlanejamentoRepository extends Repository<Planejamento>{
    constructor(
        @InjectDataSource() dt: DataSource
    ){
        super(Planejamento, dt.createEntityManager());
    }
}