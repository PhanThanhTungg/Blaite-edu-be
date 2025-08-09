import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class ChangeIntervalDto {
  @IsNumber()
  @ApiProperty({
    description: 'interval send message',
    example: 10,
  })
  interval: number;
}