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

  async getKnowledgesOfTopic(topicId: string, userId: string): Promise<any> {
    const isUser = await this.checkKnowledgesUser(userId, topicId);

    if (!isUser) throw new NotFoundException("Topic not found");

    const knowledges = await this.prisma.knowledge.findMany({
      where: { topicId: topicId },
      orderBy: { createdAt: 'asc' }
    });

    return this.buildTreeOptimized(knowledges);
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
        responseAPI.push(...newKnowledge);
    }
    return this.buildTreeOptimized(responseAPI);
  }

  async generateTheory(knowledgeId: string, userId: string, maxTokens: number, temperature: number): Promise<any> {
    const knowledge:Knowledge = await this.checkKnowledge(knowledgeId, userId);
    const prompt = `
      Bạn là một giáo viên chuyên nghiệp với kinh nghiệm giảng dạy phong phú. Nhiệm vụ của bạn là tạo ra một bài giảng lý thuyết chi tiết, dễ hiểu và hấp dẫn.

      THÔNG TIN BỐI CẢNH:
      • Môn học: "${knowledge["topic"].class.name}"
      • Đối tượng học sinh: ${knowledge["topic"].class.prompt}
      • Điểm kiến thức cần giảng: "${knowledge.name}"
      • Phạm vi nội dung: ${knowledge.prompt}

      NHIỆM VỤ:
      Hãy soạn một bài giảng lý thuyết hoàn chỉnh cho điểm kiến thức trên, phù hợp với trình độ và đặc điểm của học sinh.
      Chỉ lý thuyết thôi, không cần bài tập

      YÊU CẦU KỸ THUẬT:
      • Sử dụng các thẻ HTML5, được bọc trong thẻ <div>
      • Nếu có css thì dùng inline css, theo phong cách trắng đen sang trọng
      • Tối ưu cho hiển thị web responsive
      • Độ dài: Tối đa ${maxTokens} tokens
      • Ngôn ngữ: Tiếng Việt chuẩn, dễ hiểu

      YÊU CẦU NỘI DUNG:
      • Sử dụng ngôn ngữ phù hợp với trình độ học sinh
      Đi thẳng vào lý thuyết không cần chào hỏi 
      • Bố cục logic, mạch lạc từ cơ bản đến nâng cao
      • Ưu tiên chất lượng và độ chính xác của nội dung
      • Tích hợp ví dụ thực tế để tăng hiểu biết

      Hãy bắt đầu tạo bài giảng:
    `;
    console.log(prompt);
    const response = await this.geminiService.generateText({
      prompt,
      maxTokens,
      temperature
    });
    const promptResponse = response.text.replace(/^.*\n/, '').replace(/\n.*$/, '').replace(/```/g, '');

    const newKnowledge = await this.prisma.knowledge.update({
      where: { id: knowledgeId },
      data: { theory: promptResponse }
    });
    return newKnowledge;
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

  private async checkKnowledge(knowledgeId: string, userId: string): Promise<Knowledge> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: { 
        id: knowledgeId,
        topic: { class: { userId: userId } }
      },
      include: {
        topic: {
          include: {
            class: true
          }
        }
      }
    });

    if (!knowledge) throw new NotFoundException("Knowledge not found");
    return knowledge;
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

  private async saveKnowledgeRecursively(knowledgeData: any, topicId: string, parentId?: string): Promise<Knowledge[]> {
    const newKnowledge = await this.prisma.knowledge.create({
      data: {
        name: knowledgeData.name,
        prompt: knowledgeData.prompt,
        topicId: topicId,
        parentId: parentId || null
      }
    });

    const responseAPI: Knowledge[] = [];
    responseAPI.push(newKnowledge);
    
    if (knowledgeData.children && knowledgeData.children.length > 0) {
      for (const child of knowledgeData.children) {
        const childKnowledges = await this.saveKnowledgeRecursively(child, topicId, newKnowledge.id);
        responseAPI.push(...childKnowledges);
      }
    }
  
    return responseAPI;
  };

  private async buildTreeOptimized(flatList: any) {
    const tree: any[] = [];
    const childrenMap = {};
    
    // Nhóm các children theo parentId
    flatList.forEach((item: any) => {
      const parentId = item.parentId;
      
      if (parentId === null || parentId === undefined) {
        // Không có parent -> thêm vào root
        tree.push({ ...item, children: [] });
      } else {
        // Có parent -> thêm vào map children
        if (!childrenMap[parentId]) {
          childrenMap[parentId] = [];
        }
        childrenMap[parentId].push({ ...item, children: [] });
      }
    });
    
    // Gán children cho từng node trong cây
    function assignChildren(nodes) {
      nodes.forEach((node: any) => {
        if (childrenMap[node.id]) {
          node.children = childrenMap[node.id];
          // Đệ quy gán children cho các node con
          assignChildren(node.children);
        }
      });
    }
    
    assignChildren(tree);
    return tree;
  }
  

}
