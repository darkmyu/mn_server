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
        picture: request.picture,
        gender: request.gender,
        ...(request.birthday && { birthday: new Date(request.birthday) }),
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
      throw new UnauthorizedException('you are not the owner fo this animal');
    }

    const updatedAnimal = await this.prisma.animal.update({
      where: {
        id,
      },
      data: {
        ...request,
        ...(request.birthday && { birthday: new Date(request.birthday) }),
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
      throw new UnauthorizedException('you are not the owner fo this animal');
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

  async upload(user: User, image: Express.Multer.File) {
    const key = this.fileService.generateKey({ prefix: 'animals', entityId: user.id, file: image });
    const path = await this.fileService.upload(key, image);

    return path;
  }
}
