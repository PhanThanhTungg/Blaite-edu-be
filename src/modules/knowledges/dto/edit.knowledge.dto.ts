import { PartialType } from "@nestjs/mapped-types";
import { CreateKnowledgeDto } from "./create-knowledge.dto";

export class EditKnowledgeDto extends PartialType(CreateKnowledgeDto){
}