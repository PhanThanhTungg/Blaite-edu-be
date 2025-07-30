import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

enum TypeAuth {
  account = "account",
  google = "google",
  facebook = "facebook"
}

export class UserResponseDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsEnum(TypeAuth)
  @ApiProperty()
  typeAuth: TypeAuth;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  googleId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  facebookId?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ required: false })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  telegramId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  phone?: string;

  @IsString()
  @ApiProperty()
  timezone: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  prompt?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  streak?: number;

  @IsOptional()
  @IsDate()
  @ApiProperty({ required: false })
  lastActiveDate?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
}
