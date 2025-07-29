import { Injectable, NotFoundException } from '@nestjs/common';
import { Knowledge, PrismaClient } from 'generated/prisma';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { EditKnowledgeDto } from './dto/edit.knowledge.dto';

@Injectable()
export class KnowledgesService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getOneKnowledge(knowledgeId: string, userId: string): Promise<Knowledge> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: { 
        id: knowledgeId,
        topic: { userId: userId }
      }
    });
    
    if(!knowledge) throw new NotFoundException("Knowledge not found");

    return knowledge;
  }

  async getKnowledgesOfTopic(topicId: string, userId: string): Promise<Knowledge[]> {
    const isUser = await this.checkKnowledgesUser(userId, topicId);

    if (!isUser) throw new NotFoundException("Topic not found");

    const knowledges = await this.prisma.knowledge.findMany({
      where: { topicId: topicId },
      orderBy: { createdAt: 'desc' }
    });

    return knowledges;
  }

  async createKnowledge(knowledge: CreateKnowledgeDto, userId: string): Promise<Knowledge> {
    const isUser = await this.checkKnowledgesUser(userId, knowledge.topicId);

    if (!isUser) throw new NotFoundException("Topic not found");

    const newKnowledge = await this.prisma.knowledge.create({
      data: knowledge
    });
    return newKnowledge;
  }

  async editKnowledge(knowledge: EditKnowledgeDto, knowledgeId: string, userId: string): Promise<Knowledge> {
    await this.checkKnowledge(knowledgeId, userId);

    const updatedKnowledge = await this.prisma.knowledge.update({
      where: { id: knowledgeId },
      data: knowledge
    });

    return updatedKnowledge;
  }

  async deleteKnowledge(knowledgeId: string, userId: string): Promise<Knowledge> {
    await this.checkKnowledge(knowledgeId, userId);

    const deletedKnowledge = await this.prisma.knowledge.delete({
      where: { id: knowledgeId }
    });

    return deletedKnowledge;
  }

  private async checkKnowledge(knowledgeId: string, userId: string): Promise<void> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: { 
        id: knowledgeId,
        topic: { userId: userId }
      }
    });

    if (!knowledge) throw new NotFoundException("Knowledge not found");
  }

  private async checkKnowledgesUser(userId: string, topicId: string): Promise<boolean> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
        userId: userId,
      },
    });

    return !!topic;
  }

}
