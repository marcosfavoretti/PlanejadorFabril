import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './App.module';

const logger = new Logger();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  await app.init()
    .then(
      () => logger.log('🆗👌 Importador de pedidos iniciado 🆗👌')
    );
}
bootstrap();
