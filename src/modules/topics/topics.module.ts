import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { GeminiModule } from '../gemini/gemini.module';

@Module({
  controllers: [TopicsController],
  providers: [TopicsService],
  imports: [GeminiModule]
})
export class TopicsModule {}
