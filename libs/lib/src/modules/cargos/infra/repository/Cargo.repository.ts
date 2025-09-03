import { DataSource, Repository } from "typeorm";
import { Cargo } from "../../@core/entities/Cargo.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class CargoRepository extends Repository<Cargo>{
    constructor(@InjectDataSource() dt: DataSource){
        super(Cargo, dt.createEntityManager());
    }
}