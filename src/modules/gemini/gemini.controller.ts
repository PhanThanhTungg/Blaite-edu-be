import { Controller, Post, Body, HttpCode, HttpStatus, Query, ValidationPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { ChatRequestDto, ChatResponseDto, GenerateTextRequestDto, GenerateTextResponseDto } from './dto/gemini.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Gemini AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat với Gemini AI' })
  @ApiBody({ type: ChatRequestDto })
  async chat(@Body(ValidationPipe) chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    return await this.geminiService.chat(chatRequest);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate text với Gemini AI' })
  @ApiBody({ type: GenerateTextRequestDto })
  async generateText(@Body(ValidationPipe) generateRequest: GenerateTextRequestDto): Promise<GenerateTextResponseDto> {
    return await this.geminiService.generateText(generateRequest);
  }

  @Post('generate-multiple')
  @ApiOperation({ summary: 'Generate nhiều response cho cùng 1 prompt' })
  async generateMultiple(
    @Body('prompt') prompt: string,
    @Query('count') count?: number
  ): Promise<{ responses: string[] }> {
    const responses = await this.geminiService.generateMultipleResponses(prompt, count || 3);
    return { responses };
  }

  @Post('analyze-document')
  @ApiOperation({ summary: 'Phân tích tài liệu PDF với Gemini AI' })
  @UseInterceptors(FileInterceptor('file'))
  async analyzeDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt: string
  ): Promise<{ analysis: string }> {
    const documentBase64 = file.buffer.toString('base64');
    const analysis = await this.geminiService.analyzeDocument(documentBase64, prompt, file.mimetype);
    return { analysis };
  }
}
