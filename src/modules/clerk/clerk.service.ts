import { Inject, Injectable } from '@nestjs/common';
import { ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService {
  constructor(
    @Inject('ClerkClient')
    private readonly clerk: ClerkClient,
  ) {}

  async getUsersByIds(userIds: string[]) {
    const data = await this.clerk.users.getUserList({
      userId: userIds,
      limit: 1e3,
    })
    return data.data.map((user) => ({
      id: user.id,
      banned: user.banned,
      locked: user.locked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      imageUrl: user.imageUrl,
      hasImage: user.hasImage,
      email: user?.primaryEmailAddress?.emailAddress,
      primaryPhoneNumberId: user.primaryPhoneNumberId,
      lastSignInAt: user.lastSignInAt,
      externalId: user.externalId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }))
  }

}
