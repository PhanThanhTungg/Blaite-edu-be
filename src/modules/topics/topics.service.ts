import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Class, PrismaClient, Status, Topic } from '@prisma/client';
import { EditTopicDto } from './dto/edit-topic.dto';
import { GeminiService } from '../gemini/gemini.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { generateTopicPrompt } from 'src/assets/prompts/topics/generate-topic.prompt';
import { ResponseTopicDto } from './dto/respone-topic.dto';

@Injectable()
export class TopicsService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly prisma: PrismaService,
  ) {}


  async updateTopicStatus(
    topicId: string,
    status: Status,
    userId: string,
  ): Promise<Topic> {
    const topic = await this.prisma.topic.update({
      where: {
        id: topicId,
        class: { userId: userId },
        deleted: false,
      },
      data: {
        status: status,
      },
    });

    return topic;
  }


  async getTopic(topicId: string, userId: string): Promise<ResponseTopicDto> {
    return this.checkTopicBelongToUser(topicId, userId);
  }

  async getTopics(
    classId: string,
    userId: string,
  ): Promise<ResponseTopicDto[]> {
    const topics = await this.prisma.topic.findMany({
      where: {
        class: {
          userId: userId,
          id: classId,
        },
        deleted: false,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        classId: true,
        name: true,
        prompt: true,
        deleted: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        _count: {
          select: {
            knowledges: true,
          },
        },
        knowledges: {
          select: {
            _count: {
              select: {
                questions: true,
              },
            },
            questions: {
              select: {
                type: true,
                score: true,
              },
            },
          },
        },
      },
    });

    const responseTopics = topics.map((topic) => {
      const listQuestionPractice: any = [];
      topic.knowledges
        .filter((knowledge) => knowledge.questions.length > 0)
        .forEach((knowledge) => {
          knowledge.questions
            .filter((question) => question.type === 'practice')
            .forEach((question) => {
              listQuestionPractice.push(question);
            });
        });
      const listQuestionTheory: any = [];
      topic.knowledges
        .filter((knowledge) => knowledge.questions.length > 0)
        .forEach((knowledge) => {
          knowledge.questions
            .filter((question) => question.type === 'theory')
            .forEach((question) => {
              listQuestionTheory.push(question);
            });
        });
      const res: ResponseTopicDto = {
        id: topic.id,
        name: topic.name,
        prompt: topic.prompt || 'Không có mô tả',
        classId: topic.classId,
        deleted: topic.deleted,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
        status: topic.status,
        totalKnowledge: topic._count.knowledges,
        totalQuestion: topic.knowledges.reduce(
          (acc, knowledge) => acc + knowledge._count.questions,
          0,
        ),
        avgScorePractice: listQuestionPractice
          ? listQuestionPractice.reduce(
              (acc, question) => acc + (question.score || 0),
              0,
            ) / listQuestionPractice.length
          : 0,
        avgScoreTheory: listQuestionTheory
          ? listQuestionTheory.reduce(
              (acc, question) => acc + (question.score || 0),
              0,
            ) / listQuestionTheory.length
          : 0,
      };
      return res;
    });

    return responseTopics;
  }

  async createTopic(
    topic: CreateTopicDto,
    classId: string,
    userId: string,
  ): Promise<Topic> {
    await this.checkClassBelongToUser(classId, userId);
    const newTopic = await this.prisma.topic.create({
      data: {
        name: topic.name,
        prompt: topic.prompt,
        classId,
      },
    });
    return newTopic;
  }

  async generateTopic(
    classId: string,
    userId: string,
    maxTokens: number,
    temperature: number,
  ): Promise<Topic[]> {
    const classFound = await this.checkClassBelongToUser(classId, userId);
    const prompt = generateTopicPrompt(classFound, maxTokens);
    const response = await this.geminiService.generateText({
      prompt,
      maxTokens,
      temperature,
    });

    await this.prisma.topic.deleteMany({
      where: {
        classId: classId,
      },
    });

    const responseAPI: Topic[] = [];
    const result = JSON.parse(
      response.text.replace(/^.*\n/, '').replace(/\n.*$/, ''),
    );
    for (const topic of result) {
      const newTopic = await this.prisma.topic.create({
        data: {
          name: topic.name,
          prompt: topic.prompt,
          classId,
        },
      });
      responseAPI.push(newTopic);
    }
    return responseAPI;
  }

  async editTopic(
    topicId: string,
    topic: EditTopicDto,
    userId: string,
  ): Promise<Topic> {
    const updatedTopic = await this.prisma.topic.update({
      where: { id: topicId, class: { userId: userId }, deleted: false },
      data: topic,
    });
    return updatedTopic;
  }

  async deleteTopic(topicId: string, userId: string): Promise<Topic> {
    const deletedTopic = await this.prisma.topic.delete({
      where: { id: topicId, class: { userId: userId }, deleted: false },
    });
    return deletedTopic;
  }

  private async checkTopicBelongToUser(
    topicId: string,
    userId: string,
  ): Promise<ResponseTopicDto> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
        class: { userId: userId },
        deleted: false,
      },
      select: {
        id: true,
        classId: true,
        name: true,
        prompt: true,
        deleted: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        _count: {
          select: {
            knowledges: true,
          },
        },
        knowledges: {
          select: {
            _count: {
              select: {
                questions: true,
              },
            },
            questions: {
              select: {
                type: true,
                score: true,
              },
            },
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    const listQuestionPractice: any = [];
    topic.knowledges
      .filter((knowledge) => knowledge.questions.length > 0)
      .forEach((knowledge) => {
        knowledge.questions
          .filter((question) => question.type === 'practice')
          .forEach((question) => {
            listQuestionPractice.push(question);
          });
      });
    const listQuestionTheory: any = [];
    topic.knowledges
      .filter((knowledge) => knowledge.questions.length > 0)
      .forEach((knowledge) => {
        knowledge.questions
          .filter((question) => question.type === 'theory')
          .forEach((question) => {
            listQuestionTheory.push(question);
          });
      });
    const res: ResponseTopicDto = {
      id: topic.id,
      name: topic.name,
      prompt: topic.prompt || 'Không có mô tả',
      classId: topic.classId,
      deleted: topic.deleted,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      status: topic.status,
      totalKnowledge: topic._count.knowledges,
      totalQuestion: topic.knowledges.reduce(
        (acc, knowledge) => acc + knowledge._count.questions,
        0,
      ),
      avgScorePractice: listQuestionPractice
        ? listQuestionPractice.reduce(
            (acc, question) => acc + (question.score || 0),
            0,
          ) / listQuestionPractice.length
        : 0,
      avgScoreTheory: listQuestionTheory
        ? listQuestionTheory.reduce(
            (acc, question) => acc + (question.score || 0),
            0,
          ) / listQuestionTheory.length
        : 0,
    };
    return res;
  }

  private async checkTopicBelongToClass(
    topicId: string,
    classId: string,
  ): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId, classId: classId },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async checkTopicBelongToUserAndClass(
    topicId: string,
    userId: string,
    classId: string,
  ): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId, class: { userId: userId, id: classId } },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async checkClassBelongToUser(
    classId: string,
    userId: string,
  ): Promise<Class> {
    const classFound = await this.prisma.class.findUnique({
      where: { id: classId, userId: userId },
    });
    if (!classFound) {
      throw new NotFoundException('Class not found');
    }
    return classFound;
  }
}
