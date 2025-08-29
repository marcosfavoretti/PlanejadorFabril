import { DataSource, Repository } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { Planejamento } from "@libs/lib/modules/planejamento/@core/entities/Planejamento.entity";

export class PlanejamentoRepository extends Repository<Planejamento>{
    constructor(
        @InjectDataSource() dt: DataSource
    ){
        super(Planejamento, dt.createEntityManager());
    }
}