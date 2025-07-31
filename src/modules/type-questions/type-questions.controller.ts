import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TypeQuestionsService } from './type-questions.service';
import { CreateTypeQuestionsDto } from './dto/create-type-questions.dto';
import { QuestionType } from 'generated/prisma';
import { ApiOperation } from '@nestjs/swagger';
import { EditTypeQuestionsDto } from './dto/edit-type-questions.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';


@UseGuards(JwtAuthGuard)
@Controller('type-questions')
export class TypeQuestionsController {

  constructor(private readonly typeQuestionsService: TypeQuestionsService) {}

  // GET /type-questions
  @ApiOperation({ summary: 'Get all question types' })
  @Get()
  async getAllTypeQuestions(): Promise<QuestionType[]> {
    return this.typeQuestionsService.getAllTypeQuestions();
  }

  // GET /type-questions/:id
  @ApiOperation({ summary: 'Get a question type by id' })
  @Get(':id')
  async getOneTypeQuestion(@Param('id') id: string): Promise<QuestionType> {
    return this.typeQuestionsService.getOneTypeQuestion(id);
  }

  // POST /type-questions
  @ApiOperation({ summary: 'Create a new question type' })
  @Post()
  async createTypeQuestion(@Body() data: CreateTypeQuestionsDto): Promise<QuestionType> {
    return this.typeQuestionsService.createTypeQuestion(data);
  }

  // PATCH /type-questions/:id
  @ApiOperation({ summary: 'Edit a question type' })
  @Patch(':id')
  async editTypeQuestion(@Param('id') id: string, @Body() data: EditTypeQuestionsDto): Promise<QuestionType> {
    return this.typeQuestionsService.editTypeQuestion(id, data);
  }

  // DELETE /type-questions/:id
  @ApiOperation({ summary: 'Delete a question type' })
  @Delete(':id')
  async deleteTypeQuestion(@Param('id') id: string): Promise<QuestionType> {
    return this.typeQuestionsService.deleteTypeQuestion(id);
  }

}
