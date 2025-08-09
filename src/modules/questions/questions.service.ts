import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { EnvService } from 'src/shared/env/env.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Prisma, Question, TypeQuestion, User } from '@prisma/client';
import { generateQuestionPrompt } from 'src/assets/prompts/questions/generate-question.prompt';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly envService: EnvService,
  ) { }


  async getLatestUnansweredQuestionByKnowledge(
    knowledgeId: string,
    typeQuestion: TypeQuestion,
    userId: string,
  ): Promise<any> {
    const question = await this.prisma.question.findFirst({
      where: {
        knowledgeId,
        type: typeQuestion,
        answer: null,
        knowledge: {
          topic: {
            class: {
              user: { id: userId },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!question) {
      throw new BadRequestException('No unanswered question found');
    }

    return question; // sẽ trả về JSON object chi tiết như createQuestion
  }


  async createQuestion(
    knowledgeId: string,
    userId: string,
    typeQuestion: TypeQuestion,
  ): Promise<any> {
    // Lấy thông tin kiến thức
    const knowledge = await this.getKnowledge(knowledgeId, userId);

    // Kiểm tra xem đã có câu hỏi chưa trả lời cùng knowledgeId & typeQuestion chưa
    const existingUnanswered = await this.prisma.question.findFirst({
      where: {
        knowledgeId,
        type: typeQuestion,
        answer: null,
        knowledge: {
          topic: {
            class: {
              user: { id: userId },
            },
          },
        },
      },
    });

    if (existingUnanswered) {
      throw new BadRequestException(
        'There is already an unanswered question for this knowledge and type',
      );
    }

    // Lấy lịch sử các câu hỏi đã trả lời để truyền vào prompt
    const historyQuestion = await this.prisma.question.findMany({
      where: {
        knowledgeId,
        type: typeQuestion,
        answer: { not: null },
        score: { not: null },
        explain: { not: null },
        ...(typeQuestion === TypeQuestion.theory && {
          aiFeedback: { not: null },
        }),
      },
      select: {
        content: true,
        answer: true,
        aiFeedback: true,
      },
    });

    // Sinh prompt để tạo câu hỏi mới
    const prompt = generateQuestionPrompt(
      knowledge,
      historyQuestion,
      typeQuestion,
    );

    // Gọi Gemini API
    const response = await this.geminiService.generateText({
      prompt,
      maxTokens: this.envService.get('GEMINI_MAX_TOKEN'),
      temperature: this.envService.get('GEMINI_TEMPERATURE'),
    });
    const questionText = response.text;

    // Lưu câu hỏi mới
    const questionCreated = await this.prisma.question.create({
      data: {
        content: questionText,
        knowledgeId,
        type: typeQuestion,
      },
    });

    return questionCreated;
  }


  // async getQuestionNotAnswer(userId: string): Promise<any> {
  //   const questions = await this.prisma.question.findFirst({
  //     where: {
  //       knowledge: {
  //         topic: {
  //           class: {
  //             user: {
  //               id: userId,
  //             },
  //           },
  //         },
  //       },
  //       answer: null,
  //     },
  //   });
  //   return questions;
  // }

  async answerQuestion(
    questionId: string,
    body: AnswerQuestionDto,
    user: User,
  ): Promise<any> {
    const question = await this.getQuestion(questionId, user.id);
    if (question.answer !== null)
      throw new BadRequestException('Question already answered');

    const subTask =
      question.type === TypeQuestion.theory
        ? `
        - 0 điểm: Sai hoàn toàn, không liên quan
        - 1-25 điểm: Gần đúng/đoán đúng 1 phần nhỏ
        - 26-50 điểm: Có ý đúng nhưng thiếu/thiếu rõ ràng
        - 51-75 điểm: Gần đúng toàn bộ, chỉ thiếu vài chi tiết nhỏ
        - 76-99 điểm: Gần như đúng hoàn toàn, chỉ sai rất nhỏ (chính tả, ngữ pháp nhẹ,...)
        - 100 điểm: Đúng tuyệt đối, đầy đủ, rõ ràng
      `
        : `
        - 0 điểm: sai
        - 100 điểm : đúng
      `;

    const prompt = `
      Bạn là một chuyên gia giáo dục trong lĩnh vực ${question.knowledge.topic.class.name}.
      Tôi sẽ cung cấp cho bạn một câu hỏi và câu trả lời của học sinh
      Câu hỏi: ${question.content}
      Câu trả lời của học sinh: ${body.answer}
      NHIỆM VỤ:
        1. Hãy chấm điểm câu trả lời của học sinh theo thang điểm sau:
          ${subTask}
        2. Trả về đúng điểm số và giải thích tại sao, nếu đúng tại sao đúng, nếu sai tại sao sai.
        ${question.type === TypeQuestion.theory ? '3. Đánh giá học sinh ngắn gọn : hiểu được phần nào, còn yếu phần nào, dùng ở biến aiFeedback ở đầu ra' : ''}

      YÊU CẦU ĐẦU RA:
        Dạng JSON: 
        {
          score: number,
          explain: string
          ${question.type === TypeQuestion.theory ? ', aiFeedback: string' : ''}
        }
    `;

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
  ): Promise<any> {
    const knowledge = await this.prisma.knowledge.findUnique({
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

  private async getQuestion(questionId: string, userId: string): Promise<any> {
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
