import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdateRequest } from './dto/user-update-request.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

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
        thumbnail: request.thumbnail,
        socialLinks: {
          deleteMany: {},
          create: request.socialLinks.map((socialLink) => ({
            type: socialLink.type,
            url: socialLink.url,
          })),
        },
      },
      include: {
        socialLinks: true,
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

  async thumbnail(thumbnail: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'profiles', file: thumbnail });
    return this.fileService.upload(key, thumbnail);
  }
}
