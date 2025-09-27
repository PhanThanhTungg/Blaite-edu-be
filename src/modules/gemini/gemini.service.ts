import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ChatRequestDto, ChatResponseDto, GenerateTextRequestDto, GenerateTextResponseDto } from './dto/gemini.dto';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string = 'gemini-2.0-flash-lite';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      const model: GenerativeModel = this.genAI.getGenerativeModel({ model: this.defaultModel });
      console.log(chatRequest.prompt);
      const result = await model.generateContent(chatRequest.prompt);
      console.log(result);
      const response = await result.response;
      const text = response.text();

      return {
        response: text,
        model: this.defaultModel,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new InternalServerErrorException('Failed to generate response from Gemini API');
    }
  }

  async generateText(generateRequest: GenerateTextRequestDto): Promise<GenerateTextResponseDto> {
    try {
      const modelName = generateRequest.model || this.defaultModel;
      const model: GenerativeModel = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          maxOutputTokens: generateRequest.maxTokens || this.configService.get<number>('GEMINI_MAX_TOKEN '),
          temperature: generateRequest.temperature || this.configService.get<number>('GGEMINI_TEMPERATURE'),
        }
      });

      const result = await model.generateContent(generateRequest.prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        model: modelName,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        }
      };
    } catch (error) {
      console.error('Error generating text with Gemini API:', error);
      throw new InternalServerErrorException('Failed to generate text from Gemini API');
    }
  }

  async generateMultipleResponses(prompt: string, count: number = 3): Promise<string[]> {
    try {
      const model: GenerativeModel = this.genAI.getGenerativeModel({ model: this.defaultModel });
      const responses: string[] = [];

      for (let i = 0; i < count; i++) {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        responses.push(response.text());
      }

      return responses;
    } catch (error) {
      console.error('Error generating multiple responses:', error);
      throw new InternalServerErrorException('Failed to generate multiple responses');
    }
  }

  async analyzeDocument(documentBase64: string, prompt: string, mimeType: string): Promise<string> {
    try {
      const model: GenerativeModel = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      const imagePart = {
        inlineData: {
          data: documentBase64,
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new InternalServerErrorException('Failed to analyze image');
    }
  }
}
