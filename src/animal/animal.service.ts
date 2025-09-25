import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';
import { AnimalResponse } from './dto/animal-response.dto';
import { AnimalUpdateRequest } from './dto/animal-update-request.dto';

@Injectable()
export class AnimalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(user: User, request: AnimalCreateRequest) {
    const animal = await this.prisma.animal.create({
      data: {
        userId: user.id,
        breedId: request.breedId,
        name: request.name,
        gender: request.gender,
        ...(request.birthday && { birthday: new Date(request.birthday) }),
        ...(request.thumbnail && {
          thumbnails: {
            create: {
              path: request.thumbnail,
            },
          },
        }),
      },
      include: {
        user: true,
        breed: true,
        thumbnails: true,
      },
    });

    return new AnimalResponse(animal);
  }

  async update(id: number, user: User, request: AnimalUpdateRequest) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
      include: {
        thumbnails: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner fo this animal');
    }

    const currentThumbnail = animal.thumbnails.length > 0 ? animal.thumbnails[0].path : null;

    const updatedAnimal = await this.prisma.animal.update({
      where: {
        id,
      },
      data: {
        breedId: request.breedId,
        name: request.name,
        gender: request.gender,
        ...(request.birthday && { birthday: new Date(request.birthday) }),
        ...(request.thumbnail &&
          request.thumbnail !== currentThumbnail && {
            thumbnails: {
              create: {
                path: request.thumbnail,
              },
            },
          }),
      },
      include: {
        user: true,
        breed: true,
        thumbnails: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    return new AnimalResponse(updatedAnimal);
  }

  async delete(id: number, user: User) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner fo this animal');
    }

    const deletedAnimal = await this.prisma.animal.delete({
      where: {
        id,
      },
      include: {
        user: true,
        breed: true,
        thumbnails: {
          take: 1,
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    return new AnimalResponse(deletedAnimal);
  }

  async upload(thumbnail: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'thumbnails', file: thumbnail });

    return this.fileService.upload(key, thumbnail);
  }
}
