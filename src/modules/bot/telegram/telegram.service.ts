import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { EnvService } from 'src/shared/env/env.service';
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private bot: typeof TelegramBot;

  constructor(
    private readonly envService: EnvService,
    private readonly usersService: UsersService,
  ) {
    this.bot = new TelegramBot(envService.get('TELE_BOT_TOKEN'), {
      polling: true,
    });
    // let url = envService.get('DEPLOY_URL');
    // this.bot.setWebHook(`${envService.get('DEPLOY_URL')}/telegram/webhook`);
    this.bot.on('message', (msg) => {
      console.log('Received message:', msg);
      this.handleUpdate(msg);
    });
  }

  async handleUpdate(message: any) {
    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;
      try {
        if (text.startsWith('/start')) {
          const userId = text.split(' ')[1];
          const checkUser = await this.usersService.checkUserById(userId);
          if (checkUser) {
            await this.usersService.setTelegramId(checkUser.id, chatId+"");
            this.bot.sendMessage(
              chatId,
              `<b>Kết nối thành công!</b>\n\n` +
                `<b>ID:</b> <code>${checkUser.id}</code>\n`,
              { parse_mode: 'HTML' },
            );
          } else {
            this.bot.sendMessage(chatId, `Không tìm thấy tài khoản`);
          }
        } else {
          this.bot.sendMessage(chatId, 
            `Bạn vừa nói: ${message.text}\n`+
            `<code>123455</code>`
            , {parse_mode: 'HTML'});
        }
      } catch (error) {
        console.log(error);
        this.bot.sendMessage(chatId, `Lỗi: ${error.message}`);
      }
    }
  }
}
