import { Module } from '@nestjs/common';
import { KnowledgesController } from './knowledges.controller';
import { KnowledgesService } from './knowledges.service';

@Module({
  controllers: [KnowledgesController],
  providers: [KnowledgesService]
})
export class KnowledgesModule {}
