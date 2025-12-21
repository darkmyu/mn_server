import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
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
    return new Pagination(animals, 1, animals.length, animals.length, false);
  }

  async photos(username: string, { cursor, limit }: CursorPaginationQuery) {
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
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: 'desc',
        },
      }),
    ]);

    const hasNextPage = photos.length > limit;
    if (hasNextPage) {
      photos.pop();
    }

    const items = photos.map((photo) => new PhotoResponse(photo));
    const nextCursor = hasNextPage ? photos[photos.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
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
