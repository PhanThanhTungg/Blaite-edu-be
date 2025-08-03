import { Body, Controller, Param, ParseEnumPipe, Post, UseGuards } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Question, TypeQuestion, User } from '@prisma/client';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('questions')
export class QuestionsController {

  constructor(private readonly questionsService: QuestionsService) {}

  @Post('knowledge/:id/generate/:typeQuestion')
  async generateQuestion(
    @Param('id') knowledgeId: string, 
    @Param('typeQuestion', new ParseEnumPipe(TypeQuestion)) typeQuestion: TypeQuestion,
    @CurrentUser() user: User
  ): Promise<any> {
    return this.questionsService.createQuestion(knowledgeId, user.id, typeQuestion);
  }

  @Post('answer/:id')
  async answerQuestion(
    @Param('id') questionId: string,
    @Body() body: AnswerQuestionDto,
    @CurrentUser() user: User
  ): Promise<Question> {
    return this.questionsService.answerQuestion(questionId, body, user.id);
  }
}
