import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginThrottlerGuard } from '../../common/guards/login-throttler.guard';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LoginThrottlerGuard],
  exports: [AuthService]
})
export class AuthModule { }
