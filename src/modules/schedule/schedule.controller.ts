import { Body, Controller, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';
import { ScheduleService } from './schedule.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('schedule')
@UseGuards(ClerkAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('change-interval')
  async changeInterval(
    @Body(ParseIntPipe) interval: number,
    @CurrentUser() user,
  ) {
    return this.scheduleService.changeInterval(interval, user.id);
  }
}
