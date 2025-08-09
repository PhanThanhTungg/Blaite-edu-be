import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { EnvService } from 'src/shared/env/env.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Prisma, PrismaClient, Question, TypeQuestion, User } from '@prisma/client';
import { generateQuestionPrompt } from 'src/assets/prompts/questions/generate-question.prompt';
import { answerQuestionPrompt } from 'src/assets/prompts/questions/answer-question.prompt';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly envService: EnvService,
  ) {}

  async createQuestion(
    knowledgeId: string,
    userId: string,
    typeQuestion: TypeQuestion,
    prismaClient:PrismaClient | Prisma.TransactionClient = this.prisma
  ): Promise<any> {
    const knowledge = await this.getKnowledge(knowledgeId, userId, prismaClient);

    const checkAnswerPre = await prismaClient.question.findMany({
      where: {
        knowledgeId: knowledgeId,
        type: typeQuestion,
        answer: null,
      },
    });
    if (checkAnswerPre.length > 0)
      throw new BadRequestException('Have question not answer');

    const historyQuestion = await prismaClient.question.findMany({
      where: {
        knowledgeId: knowledgeId,
        type: typeQuestion,
        answer: {
          not: null,
        },
        score: {
          not: null,
        },
        explain: {
          not: null,
        },
        ...(typeQuestion === TypeQuestion.theory && {
          aiFeedback: {
            not: null,
          },
        }),
      },
      select: {
        content: true,
        answer: true,
        aiFeedback: true,
      },
    });

    const prompt = generateQuestionPrompt(
      knowledge,
      historyQuestion,
      typeQuestion,
    );

    const response = await this.geminiService.generateText({
      prompt,
      maxTokens: this.envService.get('GEMINI_MAX_TOKEN'),
      temperature: this.envService.get('GEMINI_TEMPERATURE'),
    });
    const question = response.text;

    const questionCreated = await prismaClient.question.create({
      data: {
        content: question,
        knowledgeId: knowledgeId,
        type: typeQuestion,
      },
    });
    return questionCreated;
  }

  async answerQuestion(
    questionId: string,
    body: AnswerQuestionDto,
    user: User,
  ): Promise<any> {
    const question = await this.getQuestion(questionId, user.id);
    if (question.answer !== null)
      throw new BadRequestException('Question already answered');

    const prompt = answerQuestionPrompt(question, body.answer);

    const response = await this.geminiService.generateText({
      prompt,
      maxTokens: this.envService.get('GEMINI_MAX_TOKEN'),
      temperature: this.envService.get('GEMINI_TEMPERATURE'),
    });
    const answer = JSON.parse(
      response.text.replace('```json', '').replace('```', ''),
    );

    return await this.prisma.$transaction(async (tx) => {
      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: {
          answer: body.answer,
          score: answer.score,
          explain: answer.explain,
          ...(question.type === TypeQuestion.theory && {
            aiFeedback: answer.aiFeedback,
          }),
        },
      });
      await this.updateActivity(user, tx);

      return updatedQuestion;
    });
  }

  private async getKnowledge(
    knowledgeId: string,
    userId: string,
    prismaClient:PrismaClient | Prisma.TransactionClient = this.prisma
  ): Promise<any> {
    const knowledge = await prismaClient.knowledge.findUnique({
      where: {
        id: knowledgeId,
        topic: {
          class: {
            user: {
              id: userId,
            },
          },
        },
      },
      include: {
        topic: {
          include: {
            class: true,
          },
        },
        questions: true,
      },
    });
    return knowledge;
  }
  

  async getQuestion(questionId: string, userId: string): Promise<any> {
    const question = await this.prisma.question.findUnique({
      where: {
        id: questionId,
        knowledge: {
          topic: {
            class: {
              user: {
                id: userId,
              },
            },
          },
        },
      },
      include: {
        knowledge: {
          include: {
            topic: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });
    return question;
  }

  private async updateActivity(
    user: User,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const dateNow = new Date().toLocaleDateString('sv-SE', {
      timeZone: user.timezone,
    });

    const activity = await tx.activity.findFirst({
      where: {
        userId: user.id,
        date: dateNow,
      },
    });

    if (!activity) {
      await tx.activity.create({
        data: {
          userId: user.id,
          date: dateNow,
          count: 1,
        },
      });
      const checkYesterday = await tx.activity.findFirst({
        where: {
          userId: user.id,
          date: new Date(
            new Date().setDate(new Date().getDate() - 1),
          ).toLocaleDateString('sv-SE', { timeZone: user.timezone }),
        },
      });
      if (checkYesterday) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            streak: user.streak + 1,
            ...(user.streak + 1 > user.longestStreak && {
              longestStreak: user.streak + 1,
            }),
          },
        });
      } else {
        await tx.user.update({
          where: { id: user.id },
          data: {
            streak: 1,
            lastActiveDate: new Date(dateNow),
            ...(user.longestStreak == 0 && { longestStreak: 1 }),
          },
        });
      }
    } else {
      await tx.activity.update({
        where: { id: activity.id },
        data: { count: activity.count + 1 },
      });
    }
  }
}
