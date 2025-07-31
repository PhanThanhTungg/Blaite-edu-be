import { Test, TestingModule } from '@nestjs/testing';
import { TypeQuestionsController } from './type-questions.controller';

describe('TypeQuestionsController', () => {
  let controller: TypeQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeQuestionsController],
    }).compile();

    controller = module.get<TypeQuestionsController>(TypeQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
