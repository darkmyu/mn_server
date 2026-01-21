import { PaginationQuery } from '@/common/dto/pagination-query.dto';
import { Pagination } from '@/common/dto/pagination.dto';
import { ConverterService } from '@/converter/converter.service';
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
    private readonly converterService: ConverterService,
  ) {}

  async all(query: PaginationQuery, user: User) {
    const { page, limit } = query;

    const [total, animals] = await this.prisma.$transaction([
      this.prisma.animal.count({
        where: {
          userId: user.id,
        },
      }),
      this.prisma.animal.findMany({
        where: {
          userId: user.id,
        },
        include: {
          user: true,
          breed: true,
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          id: 'asc',
        },
      }),
    ]);

    const items = animals.map((animal) => new AnimalResponse({ animal }));
    const hasNextPage = page * limit < total;

    return new Pagination(items, page, total, limit, hasNextPage);
  }

  async read(id: number, user: User) {
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

    if (animal.userId !== user.id) {
      throw new UnauthorizedException('you are not the owner of this animal');
    }

    return new AnimalResponse({ animal });
  }

  async create(user: User, request: AnimalCreateRequest) {
    const animal = await this.prisma.animal.create({
      data: {
        userId: user.id,
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

  async update(id: number, user: User, request: AnimalUpdateRequest) {
    const animal = await this.prisma.animal.findUnique({
      where: {
        id,
      },
    });

    if (!animal) {
      throw new NotFoundException('animal is not found');
    }

    if (animal.userId !== user.id) {
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
