import { Module } from '@nestjs/common';
import { TypeQuestionsController } from './type-questions.controller';
import { TypeQuestionsService } from './type-questions.service';

@Module({
  controllers: [TypeQuestionsController],
  providers: [TypeQuestionsService]
})
export class TypeQuestionsModule {}
