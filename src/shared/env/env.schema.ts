import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator'

enum Environment {
  development = 'development',
  production = 'production',
}

export class EnvSchema {
  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number

  @IsString()
  JWT_ACCESS_SECRET: string

  @IsString()
  JWT_ACCESS_EXPIRES: string

  @IsString()
  JWT_REFRESH_SECRET: string

  @IsString()
  JWT_REFRESH_EXPIRES: string

  @IsNumber()
  @Min(1)
  COOKIE_HTTP_ONLY_EXPIRE: number

  @IsString()
  GEMINI_API_KEY: string

  @IsNumber()
  @Min(0)
  @Max(1)
  GEMINI_TEMPERATURE: number

  @IsNumber()
  @Min(1)
  GEMINI_MAX_TOKEN: number
}
