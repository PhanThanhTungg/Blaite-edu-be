import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response-dto';
import { LoginDto } from './dto/login.dto';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST: /auth/register
  @Post('register')
  async register(@Body() registerDTO: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(registerDTO);
  }

  // POST: /auth/login
  @Post('login')
  @UseGuards(LoginThrottlerGuard)
  async login(@Body() loginDTO: LoginDto): Promise<UserResponseDto> {
    return this.authService.login(loginDTO);
  } 

  // POST: /auth/refresh
  @Post('refresh')
  async refresh(
    @Body('refreshToken') refreshToken: string
  ){
    return this.authService.refreshToken(refreshToken);
  }
}
