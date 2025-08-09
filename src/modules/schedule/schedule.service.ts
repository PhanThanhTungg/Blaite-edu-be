import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron(){
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    if(hour < 6) return;
    const totalMinutes = (hour - 6) * 60 + minute;

    const users = await this.prisma.$queryRaw`
      SELECT * FROM users 
      WHERE ${totalMinutes} % "intervalSendMessage" = 0
    `;
  }

  async changeInterval(interval: number, userId: string) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        intervalSendMessage: interval,
      },
    });
  }
}
