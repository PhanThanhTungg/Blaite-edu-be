import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, QuestionType } from 'generated/prisma';
import { CreateTypeQuestionsDto } from './dto/create-type-questions.dto';
import { EditTypeQuestionsDto } from './dto/edit-type-questions.dto';

@Injectable()
export class TypeQuestionsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getOneTypeQuestion(id: string): Promise<QuestionType> {
    const typeQuestion = await this.prisma.questionType.findUnique({
      where: { id , deleted: false},
    });
    if (!typeQuestion) {
      throw new NotFoundException('Type question not found');
    }
    return typeQuestion;
  }

  async getAllTypeQuestions(): Promise<QuestionType[]> {
    return this.prisma.questionType.findMany({
      where: { deleted: false },
    });
  }

  async createTypeQuestion(
    data: CreateTypeQuestionsDto,
  ): Promise<QuestionType> {
    return this.prisma.questionType.create({
      data,
    });
  }

  async editTypeQuestion(
    id: string,
    data: EditTypeQuestionsDto,
  ): Promise<QuestionType> {
    return this.prisma.questionType.update({
      where: { id },
      data,
    });
  }

  async deleteTypeQuestion(id: string): Promise<QuestionType> {
    return this.prisma.questionType.delete({
      where: { id },
    });
  }
}
