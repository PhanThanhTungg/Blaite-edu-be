import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AnswerQuestionDto {
  @IsNotEmpty({ message: 'Answer is required' })
  @ApiProperty({
    description: 'Answer of question',
    example: 'Answer of question'
  })
  answer: string;
}