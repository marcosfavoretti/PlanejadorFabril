import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200', 'http://192.168.99.129:4200', '*'], // Altere conforme necessário
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,

  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'XYZ')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document, { raw: ['yaml', 'json'], useGlobalPrefix: true });
  
  const port = process.env.PORT ?? 3000
  await app.listen(port)
    .then(() => { console.log(`http://localhost:${port}/api/doc`) });
}
bootstrap();
