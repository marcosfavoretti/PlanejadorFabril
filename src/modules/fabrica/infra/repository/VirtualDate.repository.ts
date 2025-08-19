import { DataSource, Repository } from "typeorm";
import { VirtualDate } from "../../../fabrica/@core/entities/VirtualDate.entity";
import { InjectDataSource } from "@nestjs/typeorm";

export class VirtualDateRepository extends Repository<VirtualDate> {
    constructor(@InjectDataSource() dt: DataSource) {
        super(VirtualDate, dt.createEntityManager());
    }
}