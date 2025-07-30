import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateKnowledgeDto{
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  @ApiProperty({
    description: "Name of the knowledge",
    example: "Từ vựng tiếng anh sơ cấp",
  })
  name: string;

  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MaxLength(1000, { message: "Content must be less than 1000 characters" })
  @ApiProperty({
    description: "Content of the knowledge",
    example: "Tôi muốn học từ vựng tiếng anh sơ cấp toeic",
  })
  content: string;

  @IsString({ message: "Parent ID must be a string" })
  @IsOptional()
  @ApiProperty({
    description: "ID of the parent knowledge",
    example: "3f92a5df-09d9-4ae1-ab99-421c7da12ac9",
    required: false
  })
  parentId: string;

  @IsString({ message: "Topic ID must be a string" })
  @IsNotEmpty({ message: "Topic ID is required" })
  @ApiProperty({
    description: "ID of the topic this knowledge belongs to",
    example: "3f92a5df-09d9-4ae1-ab99-421c7da12ac9",
  })
  topicId: string;
}
