import { NestFactory } from '@nestjs/core';
import { JobsModule } from './modules/jobs/Jobs.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger();
    const app = await NestFactory.create(JobsModule);
    await app.init();
    logger.log('WORKER STARTUP👌', 'Jobs Module');
}
bootstrap();