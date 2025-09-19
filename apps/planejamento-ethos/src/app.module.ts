import { Module } from '@nestjs/common';
import { DeliveryModule } from './delivery/Delivery.module';
import { TypeormDevConfigModule } from '@libs/lib/config/TypeormDevConfig.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TypeormDevConfigModule,
    DeliveryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
