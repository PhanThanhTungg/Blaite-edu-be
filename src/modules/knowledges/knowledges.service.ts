import { Injectable, NotFoundException } from '@nestjs/common';
import { Knowledge, PrismaClient, Topic } from 'generated/prisma';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { EditKnowledgeDto } from './dto/edit.knowledge.dto';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class KnowledgesService {
  private prisma: PrismaClient;
  constructor(private readonly geminiService: GeminiService) {
    this.prisma = new PrismaClient();
  }

  async getOneKnowledge(knowledgeId: string, userId: string): Promise<Knowledge> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: { 
        id: knowledgeId,
        topic: { class: { userId: userId } }
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

  async generateKnowledge(topicId: string, userId: string, maxTokens: number, temperature: number): Promise<any> {
    const topic:Topic = await this.checkKnowledgesUser(userId, topicId);
    const prompt = `
      Bạn là một chuyên gia giáo dục có kinh nghiệm thiết kế chương trình học.

      THÔNG TIN LỚP HỌC:
      - Tên lớp: "${topic["class"].name}"
      - Yêu cầu học tập: ${topic["class"].prompt}

      CHỦ ĐỀ CẦN PHÂN TÍCH:
      - Tên chủ đề: "${topic.name}"
      - Mô tả chi tiết: ${topic.prompt}

      NHIỆM VỤ:
      Hãy phân tích chủ đề trên và tạo ra một cấu trúc kiến thức hoàn chỉnh với các knowledge point theo thứ bậc phù hợp với trình độ học sinh.

      YÊU CẦU ĐẦU RA:
      1. Trả về CHÍNH XÁC định dạng JSON array
      2. Mỗi knowledge point bao gồm:
        - "name": Tên ngắn gọn, dễ hiểu của điểm kiến thức
        - "prompt": Mô tả chi tiết nội dung và phạm vi kiến thức (50-100 từ)
        - "children": Array các knowledge point con (có thể lồng nhiều cấp)
      3. Cấu trúc từ tổng quát đến chi tiết (có thể 3-4 cấp độ nếu bạn thấy cần thiết)
      4. Đảm bảo độ dài phản hồi < ${maxTokens} tokens
      5. Ưu tiên chất lượng nội dung hơn số lượng
      6. LUÔN kết thúc bằng "]" để hoàn thiện JSON

      VÍ DỤ ĐỊNH DẠNG:
      [{"name":"Kiến thức nền tảng","prompt":"Các khái niệm cơ bản...","children":[{"name":"Khái niệm A","prompt":"Chi tiết về...","children":[]}]}]
    `;

    const response = await this.geminiService.generateText({
      prompt,
      maxTokens,
      temperature
    });
    const result = JSON.parse(response.text.replace(/^.*\n/, '').replace(/\n.*$/, ''));
    const responseAPI: Knowledge[] = [];
    for (const knowledge of result) {
        const newKnowledge = await this.saveKnowledgeRecursively(knowledge, topicId);
        responseAPI.push(newKnowledge);
    }
    return responseAPI;
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
        topic: { class: { userId: userId } }
      }
    });

    if (!knowledge) throw new NotFoundException("Knowledge not found");
  }

  private async checkKnowledgesUser(userId: string, topicId: string): Promise<Topic> {
    const topic: Topic | null = await this.prisma.topic.findUnique({
      where: {
        id: topicId,
        class: { userId: userId }
      },
      include: {
        class: true
      }
    });
    if (!topic) throw new NotFoundException("Topic not found");
    return topic;
  }

  private async saveKnowledgeRecursively(knowledgeData: any, topicId: string, parentId?: string): Promise<Knowledge> {
    const newKnowledge = await this.prisma.knowledge.create({
      data: {
        name: knowledgeData.name,
        prompt: knowledgeData.prompt,
        topicId: topicId,
        parentId: parentId || null
      }
    });
  
    if (knowledgeData.children && knowledgeData.children.length > 0) {
      for (const child of knowledgeData.children) {
        await this.saveKnowledgeRecursively(child, topicId, newKnowledge.id);
      }
    }
  
    return newKnowledge;
  };
  

}
