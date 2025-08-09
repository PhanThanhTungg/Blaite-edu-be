import { Module } from '@nestjs/common';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService],
  imports: [UsersModule]
})
export class TelegramModule {

  
  
}
