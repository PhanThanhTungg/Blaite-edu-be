import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @ApiProperty({
    description: 'User email',
    example: 'tung@gmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Name is required! Please provide name' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 charaters long' })
  @MaxLength(50, { message: 'Name can not be longer than 50 charaters' })
  @ApiProperty({
    description: 'User name',
    example: 'Tung Phan',
  })
  name: string;

  @IsNotEmpty({ message: 'Password is required! Please provide Password' })
  @MinLength(6, { message: 'Password must be at least 6 charaters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @ApiProperty({
    description: 'User password',
    example: 'Tt123456@',
  })
  password: string;
}
