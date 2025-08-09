// dto/update-topic-status.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Status } from "@prisma/client";

export class UpdateTopicStatusDto {
  @IsEnum(Status, { message: 'Status must be a valid enum value' })
  @ApiProperty({
    description: 'New status of the topic',
    example: Status.active,
    enum: Status,
  })
  status: Status;
}
