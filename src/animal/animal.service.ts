import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { ConverterService } from '@/converter/converter.service';
import { FileService } from '@/file/file.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';
import { AnimalResponse } from './dto/animal-response.dto';
import { AnimalUpdateRequest } from './dto/animal-update-request.dto';

@Injectable()
export class AnimalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly converterService: ConverterService,
  ) {}

  async all(query: CursorPaginationQuery, viewer: User) {
    const { cursor, limit } = query;

    const [total, animals] = await this.prisma.$transaction([
      this.prisma.animal.count({
        where: {
          userId: viewer.id,
        },
      }),
      this.prisma.animal.findMany({
        where: {
          userId: viewer.id,
        },
        include: {
          user: true,
          breed: true,
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const hasNextPage = animals.length > limit;
    if (hasNextPage) {
      animals.pop();
    }

    const items = animals.map((animal) => new AnimalResponse({ animal }));
    const nextCursor = hasNextPage ? animals[animals.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }

  async read(id: number, viewer: User) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        breed: true,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    return new AnimalResponse({ animal });
  }

  async create(viewer: User, request: AnimalCreateRequest) {
    const animal = await this.prisma.animal.create({
      data: {
        userId: viewer.id,
        breedId: request.breedId,
        name: request.name,
        gender: request.gender,
        thumbnail: request.thumbnail,
        birthday: request.birthday,
      },
      include: {
        user: true,
        breed: true,
      },
    });

    return new AnimalResponse({ animal });
  }

  async update(id: number, viewer: User, request: AnimalUpdateRequest) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    const updatedAnimal = await this.prisma.animal.update({
      where: {
        id,
      },
      data: {
        breedId: request.breedId,
        name: request.name,
        gender: request.gender,
        thumbnail: request.thumbnail,
        birthday: request.birthday,
      },
      include: {
        user: true,
        breed: true,
      },
    });

    return new AnimalResponse({ animal: updatedAnimal });
  }

  async delete(id: number, viewer: User) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== viewer.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    const deletedAnimal = await this.prisma.animal.delete({
      where: {
        id,
      },
      include: {
        user: true,
        breed: true,
      },
    });

    return new AnimalResponse({ animal: deletedAnimal });
  }

  async upload(thumbnail: Express.Multer.File) {
    const converted = await this.converterService.convertHeicToJpeg(thumbnail);
    const key = this.fileService.generateKey({ prefix: 'animals', file: converted });

    return this.fileService.upload(key, converted);
  }
}
