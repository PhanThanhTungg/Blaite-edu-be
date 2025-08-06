import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from 'src/common/strategies/clerk.strategy';
import { ClerkClientProvider } from '../clerk/clerk.provider';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    UsersModule
  ],
  providers: [ClerkStrategy, ClerkClientProvider],
  exports: [PassportModule]
})
export class AuthModule {}
