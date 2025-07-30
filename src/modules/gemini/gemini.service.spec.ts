import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';

describe('GeminiService', () => {
  let service: GeminiService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GEMINI_API_KEY') {
        return 'test-api-key';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error when API key is not configured', async () => {
    const mockConfigServiceNoKey = {
      get: jest.fn(() => null),
    };

    const moduleWithoutKey: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: mockConfigServiceNoKey,
        },
      ],
    }).compile();

    expect(() => {
      moduleWithoutKey.get<GeminiService>(GeminiService);
    }).toThrow('GEMINI_API_KEY is not configured in environment variables');
  });
});
