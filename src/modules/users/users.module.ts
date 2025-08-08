import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClerkModule } from '../clerk/clerk.module';
import { ClerkClientProvider } from '../clerk/clerk.provider';

@Module({
  controllers: [UsersController],
  providers: [UsersService,
    {
      provide: 'ClerkClient',
      useValue: ClerkClientProvider,
    },
  ],
  exports: [UsersService],
  imports:[ClerkModule]
})
export class UsersModule {}
