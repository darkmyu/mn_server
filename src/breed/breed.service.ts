import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BreedListQuery } from './dto/breed-list-query.dto';
import { BreedResponse } from './dto/breed-response.dto';

@Injectable()
export class BreedService {
  constructor(private readonly prisma: PrismaService) {}

  async all(query: BreedListQuery) {
    const { cursor, limit, species } = query;

    const [total, breeds] = await this.prisma.$transaction([
      this.prisma.breed.count({
        where: {
          species,
        },
      }),
      this.prisma.breed.findMany({
        where: {
          species,
        },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : Prisma.skip,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const hasNextPage = breeds.length > limit;
    if (hasNextPage) {
      breeds.pop();
    }

    const items = breeds.map((breed) => new BreedResponse({ breed }));
    const nextCursor = hasNextPage ? breeds[breeds.length - 1].id : null;

    return new CursorPagination(items, nextCursor, total, limit, hasNextPage);
  }
}
