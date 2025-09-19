import { typeormSynecoConfig } from "@libs/lib/config/TypeormSynecoConfig.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { IBuscaCalendario } from "./modules/calendario-logix/@core/interfaces/IBuscaCalendario";
import { CalendarioLogixDao } from "./modules/calendario-logix/infra/DAO/CalendarioLogix.dao";
import { ISincronizaCalendario } from "./modules/calendario-logix/@core/interfaces/ISincronizaCalendario";

@Module({
    imports: [
        typeormSynecoConfig([]),
        ScheduleModule
    ],
    providers: [
        {
            provide: IBuscaCalendario,
            useClass: CalendarioLogixDao
        },
        {
            provide: ISincronizaCalendario,
            useClass: CalendarioLogixDao
            //posso colocar um service de lib para salvar no meu banco usando o orm nao query
        }
    ]
})
export class AppModule { }