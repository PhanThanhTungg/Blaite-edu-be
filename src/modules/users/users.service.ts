import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class UsersService {

  constructor(private readonly prisma: PrismaService) {}

  async authUser(userRequest: any) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userRequest.id,
      },
    });

    if (!user) {
      const newUser = await this.prisma.user.create({
        data: {
          clerkId: userRequest.id,
        },
      });

      return newUser;
    }

    return user;
  }

  async getUserInfo(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

}
