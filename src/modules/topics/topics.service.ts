import { Injectable } from '@nestjs/common';
import { CreateTopicDto } from './dto/create-topic.dto';
import { PrismaClient, Topic } from 'generated/prisma';
import { EditTopicDto } from './dto/edit-topic.dto';

@Injectable()
export class TopicsService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getTopics(userId: string): Promise<Topic[]> {
    const topics = await this.prisma.topic.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return topics;
  }

  async createTopic(topic: CreateTopicDto, userId: string): Promise<Topic> {
    const newTopic = await this.prisma.topic.create({
      data: {
        name: topic.name,
        description: topic.description,
        prompt: topic.prompt,
        userId: userId,
      },
    });
    return newTopic;
  }

  async editTopic(topicId: string, topic: EditTopicDto, userId: string): Promise<Topic> {
    const updatedTopic = await this.prisma.topic.update({
      where: { id: topicId, userId: userId },
      data: topic,
    });
    return updatedTopic;
  }

  async deleteTopic(topicId: string, userId: string): Promise<Topic> {
    const deletedTopic = await this.prisma.topic.delete({
      where: { id: topicId, userId: userId },
    });
    return deletedTopic;
  }
}
