import { DataSource, Repository } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { TabelaProducao } from "src/modules/planejamento/@core/entities/TabelaProducao.entity";

export class TabelaProducaoRepository extends Repository<TabelaProducao>{
    constructor(@InjectDataSource() dt: DataSource){
        super(TabelaProducao, dt.createEntityManager());
    }
}