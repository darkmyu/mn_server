import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { Pagination } from '@/common/dto/pagination.dto';
import { PhotoResponse } from '@/photo/dto/photo-response.dto';
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

  async photos(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        photos: {
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
          orderBy: {
            id: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    const photos = user.photos.map((photo) => new PhotoResponse(photo));
    return new Pagination(photos, 1, photos.length, photos.length, true);
  }
}
