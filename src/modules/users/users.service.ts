import { ClerkClient, verifyToken } from '@clerk/backend';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { EnvService } from 'src/shared/env/env.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class UsersService  {

  constructor(
    private readonly prisma: PrismaService,
    @Inject('ClerkClient')
    private readonly clerkClient: ClerkClient,
    private readonly env: EnvService,
  ) { }

  authUser(userRequest: Request) {
  }

  async getUserInfo(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user){
      const newUser = await this.prisma.user.create({
        data: {
          clerkId,
        },
      });
      return newUser;
    }

    return user;
  }

  async checkUserById(id: string): Promise<User | null>{
    const user = await this.prisma.user.findUnique({
      where: {
        id
      },
    });
    if(!user) return null;
    return user;
  }

  async setTelegramId(id: string, telegramId: string){
    const user = await this.prisma.user.update({
      where: {
        id
      },
      data: {
        telegramId
      }
    });
  }

}
