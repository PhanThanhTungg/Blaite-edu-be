import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { GeminiService } from '../gemini/gemini.service';
import { EnvService } from 'src/shared/env/env.service';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { Question, TypeQuestion } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiService: GeminiService,
    private readonly envService: EnvService
  ) {}

  async createQuestion(knowledgeId: string, userId: string, typeQuestion: TypeQuestion): Promise<any> {
    const knowledge = await this.getKnowledge(knowledgeId, userId);

    const subTask = typeQuestion === TypeQuestion.theory ? 
    'Câu hỏi dưới dạng hỏi đáp ngắn về lý thuyết, câu hỏi rõ ràng, ngắn gọn, súc tích, không quá dài để người học có thể trả lời nhanh' : 
    'Câu hỏi dưới dạng bài tập, có thể là trắc nghiệm, điền từ vào chỗ trống hoặc bất cứ dạng bài tập nào bạn cho là phù hợp';

    const checkAnswerPre = await this.prisma.question.findMany({
      where: {
        knowledgeId: knowledgeId,
        type: typeQuestion,
        answer: null
      }
    })
    if(checkAnswerPre.length > 0) throw new BadRequestException('Have question not answer');

    if (checkAnswerPre.length > 0) {
      return checkAnswerPre[0];
    }
      
    const historyQuestion = await this.prisma.question.findMany({
      where: {
        knowledgeId: knowledgeId,
        type: typeQuestion,
        answer: {
          not: null
        },
        score: {
          not: null
        },
        explain:{
          not: null
,       },
        ...(typeQuestion === TypeQuestion.theory && { aiFeedback: {
          not: null
        }})
      },
      select:{
        content: true,
        answer: true,
        aiFeedback: true
      }
    });

    const prompt = `
      Bạn là một chuyên gia giáo dục có kinh nghiệm thiết kế chương trình học.

      THÔNG TIN LỚP HỌC:
      - Tên lớp: "${knowledge.topic.class.name}"
      - Yêu cầu học tập: ${knowledge.topic.class.prompt}

      KIẾN THỨC CẦN TẠO CÂU HỎI:
      - Tên kiến thức: "${knowledge.name}"
      - Mô tả chi tiết: ${knowledge.prompt}

      LỊCH SỬ HỎI ĐÁP:
      ${historyQuestion.map((question, index) => `- Câu hỏi ${index + 1}: ${question.content}\n- Câu trả lời: ${question.answer}\n- Đánh giá: ${question.aiFeedback}`).join('\n')}

      NHIỆM VỤ:
      Dựa vào những thông tin trên, hãy tạo ra đúng 1 câu hỏi phù hợp đáp ứng việc học tập hiệu quả của học sinh
      Nếu bạn cảm thấy học sinh cần cải thiện phần nào hãy đặt câu hỏi để học sinh cải thiện phần đó
      Nếu bạn cảm thấy học sinh cần bổ sung phần nào hãy đặt câu hỏi để bổ sung phần đó. 
      ${subTask}

      YÊU CẦU ĐẦU RA:
      1. Trả về đúng câu hỏi không giải thích gì thêm, không thêm những text ngoài lề, chỉ nội dung câu hỏi thôi
      2. Đúng một câu hỏi thôi, không cần nhiều câu hỏi
      3. Đề bài phải phù hợp với kiến thức đã tạo
      4. Đề bài phải phù hợp với yêu cầu học tập của lớp học
      5. Đề bài phải phù hợp với tình hình học tập hiện tại của học sinh
    `;

    console.log(prompt);
    const response = await this.geminiService.generateText({
      prompt,
      maxTokens: this.envService.get('GEMINI_MAX_TOKEN'),
      temperature: this.envService.get('GEMINI_TEMPERATURE')
    });
    const question = response.text;

    const questionCreated = await this.prisma.question.create({
      data: {
        content: question,
        knowledgeId: knowledgeId,
        type: typeQuestion
      }
    });
    return questionCreated;
  }

  async answerQuestion(questionId: string, body: AnswerQuestionDto, userId: string): Promise<Question> {
    const question = await this.getQuestion(questionId, userId);
    if(question.answer !== null) throw new BadRequestException('Question already answered');

    const subTask = question.type === TypeQuestion.theory ? 
      `
        - 0 điểm: Sai hoàn toàn, không liên quan
        - 1-25 điểm: Gần đúng/đoán đúng 1 phần nhỏ
        - 26-50 điểm: Có ý đúng nhưng thiếu/thiếu rõ ràng
        - 51-75 điểm: Gần đúng toàn bộ, chỉ thiếu vài chi tiết nhỏ
        - 76-99 điểm: Gần như đúng hoàn toàn, chỉ sai rất nhỏ (chính tả, ngữ pháp nhẹ,...)
        - 100 điểm: Đúng tuyệt đối, đầy đủ, rõ ràng
      ` : 
      `
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
      temperature: this.envService.get('GEMINI_TEMPERATURE')
    });
    const answer = JSON.parse(response.text.replace('```json', '').replace('```', ''));

    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        answer: body.answer,
        score: answer.score,
        explain: answer.explain,
        ...(question.type === TypeQuestion.theory && { aiFeedback: answer.aiFeedback })
      }
    });

    return updatedQuestion;
  }

  private async getKnowledge(knowledgeId: string, userId: string): Promise<any> {
    const knowledge = await this.prisma.knowledge.findUnique({
      where: {
        id: knowledgeId,
        topic: {
          class: {
            user: {
              id: userId
            }
          }
        }
      },
      include: {
        topic: {
          include: {
            class: true
          }
        },
        questions: true
      }
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
                id: userId
              }
            }
          }
        }
      },
      include: {
        knowledge: {
          include: {
            topic: {
              include: {
                class: true
              }
            }
          }
        }
      }
    });
    return question;
  }}
