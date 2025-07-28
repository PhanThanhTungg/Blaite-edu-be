import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response-dto';
import { LoginDto } from './dto/login.dto';
import { LoginThrottlerGuard } from '../../common/guards/login-throttler.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  // POST: /auth/register
  @Post('register')
  async register(
    @Body() registerDTO: RegisterDto,
    @Req() req: Request
  ): Promise<UserResponseDto> {
    const timezone = req.headers['x-timezone'] as string || 'UTC';
    return this.authService.register(registerDTO, timezone);
  }

  // POST: /auth/login
  @Post('login')
  @UseGuards(LoginThrottlerGuard)
  async login(
    @Body() loginDTO: LoginDto,
    @Res({passthrough: true}) res: Response
  ): Promise<UserResponseDto> {
    let result = await this.authService.login(loginDTO);
    this.setRefreshToken(res, result.refreshToken!);
    delete result.refreshToken;
    return result;
  } 

  // POST: /auth/refresh
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({passthrough: true}) res: Response
  ){
    let result = await this.authService.refreshToken(req.cookies.refreshToken);
    this.setRefreshToken(res, result.refreshToken);
    return{
      accessToken: result.accessToken,
    };
  }

  // POST: /auth/logout
  @Post('logout')
  async logout(
    @Res({passthrough: true}) res: Response
  ){
    res.clearCookie('refreshToken');
    return {
      message: 'Logged out successfully'
    };
  }

  private setRefreshToken(res: Response, refreshToken: string) {
    const maxAge: number = this.configService.get<number>('COOKIE_HTTP_ONLY_EXPIRE') || 7;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'lax',
      maxAge: +maxAge * 24 * 60 * 60 * 1000,
    });
  }
}
