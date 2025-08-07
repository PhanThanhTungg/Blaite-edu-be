import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ResponseClassDto{
  @IsString()
  @ApiProperty({
    description: 'The id of the class',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'The name of the class',
    example: 'Class 1',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'The prompt of the class',
    example: 'This is a class',
  })
  prompt: string;

  @IsString()
  @ApiProperty({
    description: 'The status of the class',
    example: 'active',
  })
  status: string;

  @IsNumber()
  @ApiProperty({
    description: 'The total topic of the class',
    example: 10,
  })
  totalTopic: number;

  @IsNumber()
  @ApiProperty({
    description: 'The total knowledge of the class',
    example: 10,
  })
  totalKnowledge: number;

  @IsNumber()
  @ApiProperty({
    description: 'The total question of the class',
    example: 10,
  })
  totalQuestion: number;
}