import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/App.module';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  await app.init()
    .then(
      () => logger.log('🆗👌 Sugestão de planejamentos 🆗👌')
    );
}
bootstrap();
