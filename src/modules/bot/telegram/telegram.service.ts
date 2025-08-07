import { Injectable } from '@nestjs/common';
import { EnvService } from 'src/shared/env/env.service';
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private bot: typeof TelegramBot;

  constructor(private readonly envService: EnvService) {
    this.bot = new TelegramBot(envService.get('TELE_BOT_TOKEN'), {
      webHook: true
    });
    let url = envService.get('DEPLOY_URL');
    this.bot.setWebHook(`${envService.get('DEPLOY_URL')}/telegram/webhook`);
  }

  handleUpdate(update: any) {
    console.log('Received update:', update);
    const message = update.message;
    if (message && message.text) {
      const chatId = message.chat.id;
      console.log(`Received message from chat ${chatId}: ${message.text}`);
      this.bot.sendMessage(chatId, `Bạn vừa nói: ${message.text}`);
    }
  }
}
