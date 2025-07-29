import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";


export class CreateKnowledgeDto{
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  @MaxLength(1000, { message: "Content must be less than 1000 characters" })
  content: string;

  @IsString({ message: "Topic ID must be a string" })
  @IsNotEmpty({ message: "Topic ID is required" })
  topicId: string;
}
