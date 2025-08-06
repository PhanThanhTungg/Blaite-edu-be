import { Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Auth user with clerk // Get user info' })
  @Post('auth')
  async authUser(@CurrentUser() user: any) {
    return this.usersService.authUser(user);
  }

}
