import { DataSource, Repository } from "typeorm";
import { TabelaProducao } from "../../@core/entities/TabelaProducao.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class TabelaProducaoRepository extends Repository<TabelaProducao>{
    constructor(@InjectDataSource() dt: DataSource){
        super(TabelaProducao, dt.createEntityManager());
    }
}