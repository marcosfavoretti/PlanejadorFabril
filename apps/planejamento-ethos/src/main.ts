import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { FastApiStyleLoggingInterceptor } from './interceptor/FastApiStyleLoggingInterceptor.interceptor';
config();
const logger = new Logger();

async function bootstrap() {


  const app = await NestFactory.create(AppModule);

  // --- LÓGICA DE CORS DINÂMICA ---
  const corsOriginsFromEnv = process.env.CORS_HOSTS;
  let allowedOrigins: string[] = [];

  if (corsOriginsFromEnv) {
    allowedOrigins = corsOriginsFromEnv.split(',');
    logger.log(`Origens CORS carregadas do .env: [${allowedOrigins.join(', ')}]`, 'CORS');
  } else {
    allowedOrigins = ['http://localhost:4200'];
    logger.warn('Variável CORS_ORIGIN não encontrada no .env. Usando fallback seguro.', 'CORS');
  }


  app.enableCors({
    origin: allowedOrigins, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)), new FastApiStyleLoggingInterceptor());


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
    .then(() => {
      logger.log(`API inciada 🫠\nhttp://localhost:${port}/api/doc`, 'API')
    });
}
bootstrap();
