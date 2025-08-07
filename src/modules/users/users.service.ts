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

  async getUserInfo(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        clerkId: id,
      },
    });

    if (!user){
      const newUser = await this.prisma.user.create({
        data: {
          clerkId: id,
        },
      });
      return newUser;
    }

    return user;
  }

}
