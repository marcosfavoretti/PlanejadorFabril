import { Module } from '@nestjs/common';
import { TypeormDevConfigModule } from './config/TypeormDevConfig.module';
import { DeliveryModule } from './delivery/Delivery.module';
import { JobsModule } from './modules/jobs/Jobs.module';

@Module({
  imports: [
    TypeormDevConfigModule,
    DeliveryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
