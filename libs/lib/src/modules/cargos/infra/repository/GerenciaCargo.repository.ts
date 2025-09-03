import { DataSource, Repository } from "typeorm";
import { GerenciaCargo } from "../../@core/entities/GerenciaCargo.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class GerenciaCargoRepository extends Repository<GerenciaCargo> {
    constructor(@InjectDataSource() dt: DataSource) {
        super(GerenciaCargo, dt.createEntityManager());
    }
}