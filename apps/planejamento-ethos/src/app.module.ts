import { Module } from '@nestjs/common';
import { DeliveryModule } from './delivery/Delivery.module';
import { TypeormDevConfigModule } from '@libs/lib/config/TypeormDevConfig.module';
@Module({
  imports: [
    TypeormDevConfigModule,
    DeliveryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
