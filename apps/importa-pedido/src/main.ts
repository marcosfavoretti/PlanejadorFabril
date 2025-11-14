import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';
import { config } from 'dotenv';
config();
const logger = new Logger();

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
  logger.log('🆗👌 Importador de pedidos iniciado 🆗👌');
}
bootstrap();
