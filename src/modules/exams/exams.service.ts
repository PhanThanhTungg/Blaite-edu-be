import { Injectable, NotFoundException } from '@nestjs/common';
import { Knowledge, PrismaClient } from '@prisma/client';
import { CreateExamDto, TypeExam } from './dto/create-exam.dto';
import { ResponseCreateExam } from './interfaces/response-create-exam.interface';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class ExamsService {
  private prisma: PrismaClient;

  constructor(private readonly geminiService: GeminiService) {
    this.prisma = new PrismaClient();
  }

  // async createExam(data: CreateExamDto, userId: string): Promise<any> {
  //   let typeQuestion;
  //   let detailTypeQuestion;
  //   if(data.type === TypeExam.evaluate_exercise || data.type === TypeExam.practice_exercise) 
  //     typeQuestion = "Bài tập";
  //   if(data.type === TypeExam.evaluate_theory || data.type === TypeExam.practice_theory) 
  //     typeQuestion = "Lý thuyết";
  //   const knowledge = await this.checkKnowledge(data.knowledgeId, userId);
  //   const prompt = `
  //     Bạn là một chuyên gia giáo dục có kinh nghiệm thiết kế chương trình học.

  //     THÔNG TIN LỚP HỌC:
  //     - Tên lớp: "${knowledge["topic"].class.name}"
  //     - Yêu cầu học tập: ${knowledge["topic"].class.prompt}

  //     THÔNG TIN KIẾN THỨC:
  //     - Tên kiến thức: "${knowledge.name}"
  //     - Mô tả kiến thức: ${knowledge.prompt}

  //     NHIỆM VỤ:
  //     Hãy thiết một bài kiểm tra theo yêu cầu:
  //     1. Bao quát toàn bộ yêu cầu học tập của học sinh
  //     2. Phù hợp với trình độ và mục tiêu của lớp học
      
  //     YÊU CẦU CÂU HỎI:
  //     1. Loại câu hỏi: ${typeQuestion}

  //     YÊU CẦU ĐẦU RA:
  //     1. Trả về CHÍNH XÁC định dạng JSON array
  //     2. Mỗi chủ đề bao gồm:
  //       - "name": Tên chủ đề ngắn gọn, rõ ràng (10-15 từ)
  //       - "prompt": Mô tả chi tiết nội dung và phạm vi chủ đề (60-100 từ)
  //     3. Đảm bảo độ dài phản hồi < ${maxTokens} tokens
  //     4. Ưu tiên chất lượng nội dung hơn số lượng chủ đề
  //     5. LUÔN kết thúc bằng "]" để hoàn thiện JSON

  //     VÍ DỤ ĐỊNH DẠNG:
  //     [{"name":"Chủ đề 1","prompt":"Mô tả chi 
    
  //   `
    
  // }

  async checkKnowledge(knowledgeId: string, userId: string): Promise<Knowledge> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: {
        id: knowledgeId,
        topic:{
          class:{
            userId
          }
        }
      }
    });

    if (!knowledge) {
      throw new NotFoundException('Knowledge not found');
    }
    return knowledge;
  }
}
