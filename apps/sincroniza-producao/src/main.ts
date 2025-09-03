import { NestFactory } from '@nestjs/core';
import { AppModule } from 'apps/importa-pedido/src/App.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();
}
bootstrap();
