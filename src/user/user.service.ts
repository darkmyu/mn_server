import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdateRequest } from './dto/user-update-request.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  read(viewer: User) {
    return new UserResponse({ user: viewer });
  }

  async update(viewer: User, request: UserUpdateRequest) {
    const user = await this.prisma.user.update({
      where: {
        id: viewer.id,
      },
      data: {
        nickname: request.nickname,
        about: request.about,
      },
    });

    return new UserResponse({ user });
  }

  async delete(viewer: User) {
    const user = await this.prisma.user.delete({
      where: {
        id: viewer.id,
      },
    });

    return new UserResponse({ user });
  }
}
