import { IsEnum, IsNumber, IsString, Max, Min } from 'class-validator'

enum Environment {
  test = 'test',
  local = 'local',
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
  CLERK_PUBLISHABLE_KEY: string

  @IsString()
  CLERK_SECRET_KEY: string

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
