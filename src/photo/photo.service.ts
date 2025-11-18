import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PhotoCreateRequest } from './dto/photo-create-request.dto';
import { PhotoResponse } from './dto/photo-response.dto';

@Injectable()
export class PhotoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(user: User, request: PhotoCreateRequest) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id: request.animalId,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    const photo = await this.prisma.photo.create({
      data: {
        userId: user.id,
        animalId: request.animalId,
        image: request.image,
        title: request.title,
        description: request.description,
        ...(request.tags && {
          tags: {
            create: request.tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { slug: name },
                  create: { name, slug: name },
                },
              },
            })),
          },
        }),
      },
      include: {
        user: true,
        animal: {
          include: {
            user: true,
            breed: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return new PhotoResponse(photo);
  }

  async upload(image: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'photos', file: image });

    return this.fileService.upload(key, image);
  }
}
