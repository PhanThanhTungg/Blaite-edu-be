import { Injectable } from '@nestjs/common';
import { QuestionsService } from 'src/modules/questions/questions.service';
import { UsersService } from 'src/modules/users/users.service';
import { EnvService } from 'src/shared/env/env.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
const TelegramBot = require('node-telegram-bot-api');

@Injectable()
export class TelegramService {
  private bot: typeof TelegramBot;

  constructor(
    private readonly envService: EnvService,
    private readonly usersService: UsersService,
    private readonly questionsService: QuestionsService,
    private readonly prisma: PrismaService,
  ) {
    this.bot = new TelegramBot(envService.get('TELE_BOT_TOKEN'), {
      webhook: true
    });
    let url = envService.get('DEPLOY_URL');
    this.bot.setWebHook(`${envService.get('DEPLOY_URL')}/telegram/webhook`);
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
            await this.usersService.setTelegramId(checkUser.id, chatId + '');
            this.sendMessage(
              chatId,
              `<b>Connected successfully!</b>\n\n` +
                `<b>ID:</b> <code>${checkUser.id}</code>\n`,
            );
          } else {
            this.sendMessage(chatId, `🚫 <code>account not found</code>`);
          }
        } else {
          const user= await this.prisma.user.findUnique({
            where: {
              telegramId: chatId + '',
            },
          });
          if(!user) {
            this.sendMessage(chatId, `🚫 <code>you are not connected to the account</code>`);
            return;
          }
          const reply = message.reply_to_message;
          if (!reply) {
            this.sendMessage(
              chatId,
              '🚫 <code>please answer a question, do not send free messages</code>',
            );
          } else {
            const questionId = reply.text.split('\n').pop(); // dòng cuối cùng là id
            const question = await this.questionsService.getQuestion(
              questionId,
              user.id,
            );
            if (!question) this.sendMessage(chatId, '🚫 <code>question not found</code>');
            const questionAnswered = await this.questionsService.answerQuestion(
              questionId,
              { answer: text },
              user,
            );
             this.sendMessage(
              chatId,
              `<b>Điểm:</b> ${questionAnswered.score}\n <b>Giải thích:</b> ${questionAnswered.explain}\n` +
                `<b>AI Feedback:</b> ${questionAnswered.aiFeedback}`,
            );
          }
        }
      } catch (error) {
        this.sendMessage(chatId, `🚫 <code>error: ${error.message}</code>`);
      }
    }
  }

  async sendMessage(chatId: string, message: string) {
    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      console.log(error);
    }
  }
}
