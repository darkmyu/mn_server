import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { Pagination } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserResponse } from './dto/user-response.dto';

@Injectable()
export class UserService {
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

    return new UserResponse(user);
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
