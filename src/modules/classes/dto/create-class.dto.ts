import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export enum ClassStatus {
  PRIVATE = 'private',
  PROTECTED = 'protected',
  PUBLIC = 'public'
}

export class CreateClassDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @ApiProperty({
    description: 'The name of the class',
    example: 'My Class',
  })
  name: string;

  @IsString({ message: 'Prompt must be a string' })
  @IsNotEmpty({ message: 'Prompt is required' })
  @ApiProperty({
    description: 'The prompt of the class',
    example: 'This is a class about the topic of the class',
  })
  prompt: string;

  @IsEnum(ClassStatus, { message: 'Status must be a valid class status' })
  @IsOptional({ message: 'Status is required' })
  @ApiProperty({
    description: 'The status of the class',
    example: ClassStatus.PRIVATE,
    required: false,
  })
  status: ClassStatus;
}