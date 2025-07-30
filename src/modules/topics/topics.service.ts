import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { Class, PrismaClient, Topic } from 'generated/prisma';
import { EditTopicDto } from './dto/edit-topic.dto';

@Injectable()
export class TopicsService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getTopic(topicId: string, userId: string, classId: string): Promise<Topic> {
    return this.checkTopicBelongToUserAndClass(topicId, userId, classId);
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
