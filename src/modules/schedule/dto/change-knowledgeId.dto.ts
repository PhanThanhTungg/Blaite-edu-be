import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ChangeKnowledgeIdDto {
  @IsString()
  @ApiProperty({
    description: 'knowledgeId',
    example: '123',
  })
  knowledgeId: string;
}