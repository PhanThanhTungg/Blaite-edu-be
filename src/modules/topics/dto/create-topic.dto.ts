import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateTopicDto {
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  prompt: string;
}