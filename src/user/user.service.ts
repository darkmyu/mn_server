import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdateRequest } from './dto/user-update-request.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: number, viewer: User, request: UserUpdateRequest) {
    if (id !== viewer.id) {
      throw new UnauthorizedException('you can only update your own profile');
    }

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        nickname: request.nickname,
        about: request.about,
      },
    });

    return new UserResponse({ user });
  }

  async delete(id: number, viewer: User) {
    if (id !== viewer.id) {
      throw new UnauthorizedException('you can only delete your own profile');
    }

    const user = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return new UserResponse({ user });
  }
}
