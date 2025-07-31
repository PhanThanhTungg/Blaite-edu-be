import { PartialType } from "@nestjs/swagger";
import { CreateTypeQuestionsDto } from "./create-type-questions.dto";

export class EditTypeQuestionsDto extends PartialType(CreateTypeQuestionsDto) {}