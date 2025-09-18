import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';
import { AnimalResponse } from './dto/animal-response.dto';

@Injectable()
export class AnimalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User, request: AnimalCreateRequest) {
    const animal = await this.prisma.animal.create({
      data: {
        userId: user.id,
        breedId: request.breedId,
        name: request.name,
        picture: request.picture,
        gender: request.gender,
        ...(request.birthday && { birthday: new Date(request.birthday) }),
        age: request.age,
      },
      include: {
        user: true,
        breed: true,
      },
    });

    return new AnimalResponse(animal);
  }
}
