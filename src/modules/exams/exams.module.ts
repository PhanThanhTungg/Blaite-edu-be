import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  controllers: [ExamsController],
  providers: [ExamsService],
  imports: [GeminiModule]
})
export class ExamsModule {}
