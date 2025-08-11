import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';


export enum TypeQuestionEnum {
  THEORY = 'theory',
  PRACTICE = 'practice',
}


export class ChangeTypeQuestionDto {
  @ApiProperty({
    enum: TypeQuestionEnum,
    description: 'Type of question',
  })
  @IsEnum(TypeQuestionEnum)
  typeQuestion: TypeQuestionEnum;
}