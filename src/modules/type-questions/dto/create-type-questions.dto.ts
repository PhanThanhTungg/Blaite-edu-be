import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTypeQuestionsDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Name of question type' })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Prompt of question type' })
  prompt?: string;
}