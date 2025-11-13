import { Pagination } from '@/common/dto/pagination.dto';
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

  async all(user: User) {
    const raws = await this.prisma.animal.findMany({
      where: {
        userId: user.id,
      },
      include: {
        user: true,
        breed: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const animals = raws.map((raw) => new AnimalResponse(raw));
    return new Pagination(animals, 1, animals.length, animals.length, true);
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

    return new AnimalResponse(animal);
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

    return new AnimalResponse(animal);
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

    return new AnimalResponse(deletedAnimal);
  }

  async upload(thumbnail: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'thumbnails', file: thumbnail });

    return this.fileService.upload(key, thumbnail);
  }
}
