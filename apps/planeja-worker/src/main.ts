import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  new Logger().log('👨‍🏭worker para planejar👨‍🏭')
}
bootstrap();
