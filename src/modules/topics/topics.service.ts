import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Class, PrismaClient, Topic } from 'generated/prisma';
import { EditTopicDto } from './dto/edit-topic.dto';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class TopicsService {
  private prisma: PrismaClient;
  constructor(private readonly geminiService: GeminiService) {
    this.prisma = new PrismaClient();
  }

  async getTopic(topicId: string, userId: string): Promise<Topic> {
    return this.checkTopicBelongToUser(topicId, userId);
  }

  async getTopics(classId: string, userId: string): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany({
      where: {
        class: {
          userId: userId,
          id: classId
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return topics;
  }

  async createTopic(topic: CreateTopicDto, classId: string, userId: string): Promise<Topic> {
    await this.checkClassBelongToUser(classId, userId);
    const newTopic = await this.prisma.topic.create({
      data: {
        name: topic.name,
        prompt: topic.prompt,
        classId
      },
    });
    return newTopic;
  }

  async generateTopic(classId: string, userId: string, maxTokens: number, temperature: number): Promise<any> {
    const classFound = await this.checkClassBelongToUser(classId, userId);
    const prompt = `
      Tôi đang tạo lớp học tên là ${classFound.name}
      Yêu cầu của học sinh về lớp học là: ${classFound.prompt}
      Bạn hãy đóng vai trò là một chuyên gia trong lĩnh vực trên hãy tạo ra các chủ đề lớn, trọng tâm đáp ứng được yêu cầu của học sinh
      Trả về dưới dạng chuỗi json là một mảng các chủ đề, mỗi chủ đề có các thuộc tính, không viết gì thêm:
      - name: tên chủ đề
      - prompt: prompt mô tả chủ đề, để từ prompt này tôi sẽ tạo ra các knowledge point cho chủ đề này
    `;
    const response = await this.geminiService.generateText({
      prompt,
      maxTokens,
      temperature
    });

    const responseAPI: Topic[] = [];
    const result = JSON.parse(response.text.replace(/^.*\n/, '').replace(/\n.*$/, ''));
    for (const topic of result) {
      const newTopic = await this.prisma.topic.create({
        data: {
          name: topic.name,
          prompt: topic.prompt,
          classId
        },
      });
      responseAPI.push(newTopic);
    }
    return responseAPI;
  }

  async editTopic(topicId: string, topic: EditTopicDto, userId: string): Promise<Topic> {
    const updatedTopic = await this.prisma.topic.update({
      where: { id: topicId, class: { userId: userId } },
      data: topic,
    });
    return updatedTopic;
  }

  async deleteTopic(topicId: string, userId: string): Promise<Topic> {
    const deletedTopic = await this.prisma.topic.delete({
      where: { id: topicId, class: { userId: userId } },
    });
    return deletedTopic;
  }

  private async checkTopicBelongToUser(topicId: string, userId: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId, class: { userId: userId } },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async checkTopicBelongToClass(topicId: string, classId: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId, classId: classId },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async checkTopicBelongToUserAndClass(topicId: string, userId: string, classId: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId, class: { userId: userId, id: classId } },
    });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }
    return topic;
  }

  private async checkClassBelongToUser(classId: string, userId: string): Promise<Class> {
    const classFound = await this.prisma.class.findUnique({
      where: { id: classId, userId: userId },
    });
    if (!classFound) {
      throw new NotFoundException('Class not found');
    }
    return classFound;
  }
}
