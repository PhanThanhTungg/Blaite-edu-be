import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

enum TypeAuth {
  account = "account",
  google = "google",
  facebook = "facebook"
}

export class UserResponseDto {
  @IsString()
  id: string;

  @IsEnum(TypeAuth)
  typeAuth: TypeAuth;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  facebookId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  streak?: number;

  @IsOptional()
  @IsDate()
  lastActiveDate?: Date;

  @IsOptional()
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}
