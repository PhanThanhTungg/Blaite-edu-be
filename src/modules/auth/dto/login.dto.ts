import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email' })
  @ApiProperty({
    description: 'User email',
    example: 'tung@gmail.com',
  })
  email: string;

  @IsNotEmpty({ message: 'Password is required! Please provide Password' })
  @MinLength(6, { message: 'Password must be at least 6 charaters long' })
  @ApiProperty({
    description: 'User password',
    example: 'Tt123456@',
  })
  password: string;
}
