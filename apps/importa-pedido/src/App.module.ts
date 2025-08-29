import { JobsModule } from "@libs/lib/modules/jobs/Jobs.module";
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { ImportadorJob } from "./application/ImportadorJob";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        JobsModule
    ],
    providers: [
        ImportadorJob
    ],
    exports: [

    ]
})
export class AppModule { }