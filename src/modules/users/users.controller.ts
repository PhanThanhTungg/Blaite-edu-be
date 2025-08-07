import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}
  
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auth user with clerk // Get user info' })
  @Post('auth')
  async authUser(@CurrentUser() user: any) {
    if(!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

}
