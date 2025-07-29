import { PartialType } from "@nestjs/mapped-types";
import { CreateKnowledgeDto } from "./create-knowledge.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class EditKnowledgeDto extends PartialType(CreateKnowledgeDto){
  @IsString({ message: "Topic ID must be a string" })
  @IsNotEmpty({ message: "Topic ID is required" })
  topicId: string;
}