import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export enum TypeExam {
  evaluate_exercise = 'evaluate_exercise',
  practice_exercise = 'practice_exercise',
  evaluate_theory = 'evaluate_theory',
  practice_theory = 'practice_theory',
}

export class CreateExamDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Prompt of exam' , required: false})
  prompt?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Type of exam', enum: TypeExam })
  type: TypeExam;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'Number of questions' })
  numberOfQuestions: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Knowledge id' })
  knowledgeId: string;
}