import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { PaginationQuery } from '@/common/dto/pagination-query.dto';
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

  async photos(username: string, { page, limit }: PaginationQuery) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    const [total, photos] = await this.prisma.$transaction([
      this.prisma.photo.count({
        where: {
          userId: user.id,
        },
      }),
      this.prisma.photo.findMany({
        where: {
          userId: user.id,
        },
        include: {
          user: true,
          image: true,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items = photos.map((photo) => new PhotoResponse(photo));
    const isLast = page * limit >= total;

    return new Pagination(items, page, total, limit, isLast);
  }

  async photo(username: string, id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new NotFoundException('user is not found');
    }

    const photo = await this.prisma.photo.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
        image: true,
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

    if (!photo) {
      throw new NotFoundException('photo is not found');
    }

    return new PhotoResponse(photo);
  }
}
