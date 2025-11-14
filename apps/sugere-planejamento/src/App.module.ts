import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AgModule } from './modules/ag/Ag.module';

@Module({
  imports: [ScheduleModule.forRoot(), AgModule],
  providers: [],
})
export class AppModule {}
