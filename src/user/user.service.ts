import { ConverterService } from '@/converter/converter.service';
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
    private readonly converterService: ConverterService,
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
    const converted = await this.converterService.convertHeicToJpeg(thumbnail);
    const key = this.fileService.generateKey({ prefix: 'profiles', file: converted });

    return this.fileService.upload(key, converted);
  }
}
