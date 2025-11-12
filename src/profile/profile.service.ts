import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { Pagination } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProfileResponse } from './dto/profile-response.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async read(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    return new ProfileResponse(user);
  }

  async animals(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        animals: {
          include: {
            user: true,
            breed: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    const animals = user.animals.map((animal) => new AnimalResponse(animal));
    return new Pagination(animals, 1, animals.length, animals.length, true);
  }
}
