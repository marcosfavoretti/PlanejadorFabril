import { VirtualDate } from "../../@core/entities/VirtualDate.entity";
import { Repository } from "typeorm";
import { Calendario } from "src/modules/shared/@core/classes/Calendario";
import { Inject, Logger, OnModuleInit } from "@nestjs/common";
import { VirtualDateRepository } from "../repository/VirtualDate.repository";

export class VirtualDateService implements OnModuleInit {
    constructor(
        @Inject(VirtualDateRepository) private virtualDateRepo: Repository<VirtualDate>
    ) { }
    private calendario = new Calendario();
    private logger: Logger = new Logger();

    async getVirtualDate(): Promise<VirtualDate> {
        return (await this.virtualDateRepo.find())[0];
    }

    async onModuleInit(): Promise<void> {
        // try {
        //     const result = await this.virtualDateRepo.exists();
        //     if (!result) {
        //         this.logger.log("data virtual padrao gerada", "DATAVIRTUAL");
        //         const virtualDate = this.virtualDateRepo.create({ virtualDate: this.calendario.inicioDoDia(new Date()) });
        //         await this.virtualDateRepo.save(virtualDate);
        //     }
        //     this.logger.log("Data virtual OK", "DATAVIRTUAL");

        // } catch (error) {
        //     throw new Error(`não foi possivel criar a data virtual ${error.message}`)
        // }
    }

    async setDateVirtual(date: Date) {
        try {
            const virtualDate = await this.getVirtualDate();
            virtualDate.virtualDate = date;
            await this.virtualDateRepo.save(virtualDate);
            return date;
        } catch (error) {
            throw new Error('nao foi possivel atualizar a data virtual')
        }
    }

    async praFrente(): Promise<Date> {
        try {
            const virtualDate = await this.getVirtualDate();
            // const novoDia = this.calendario.addDays(virtualDate.virtualDate, 1);
            const novoDia = this.calendario.proximoDiaUtil(virtualDate.virtualDate, false);
            
            virtualDate.virtualDate = novoDia;
            await this.virtualDateRepo.save(virtualDate);
            return novoDia;
        } catch (error) {
            console.error(error)
            throw new Error('nao foi possivel atrasar a data virtual')

        }
    }

    async paraTras(): Promise<Date> {
        try {
            const virtualDate = await this.getVirtualDate();
            // const novoDia = this.calendario.subDays(virtualDate.virtualDate, 1);
            const novoDia = this.calendario.ultimoDiaUtil(virtualDate.virtualDate, false);
            virtualDate.virtualDate = novoDia;
            await this.virtualDateRepo.save(virtualDate);
            return novoDia;
        } catch (error) {
            console.error(error);
            throw new Error('nao foi possivel adiantar a data virtual')
        }
    }
}