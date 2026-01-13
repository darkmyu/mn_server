import { Pagination } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BreedListQuery } from './dto/breed-list-query.dto';
import { BreedResponse } from './dto/breed-response.dto';

@Injectable()
export class BreedService {
  constructor(private readonly prisma: PrismaService) {}

  async all(query: BreedListQuery) {
    const { page, limit, species } = query;

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
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    const items = breeds.map((breed) => new BreedResponse(breed));
    const hasNextPage = page * limit < total;

    return new Pagination(items, page, total, limit, hasNextPage);
  }
}
