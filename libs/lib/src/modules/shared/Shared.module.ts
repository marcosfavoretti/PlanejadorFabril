import { Module } from '@nestjs/common';
import { EmailService } from './services/Email.service';
import { FileService } from './services/JobsFile.service';

@Module({
  imports: [],
  providers: [EmailService, FileService],
  exports: [EmailService, FileService],
})
export class SharedModule {}
