import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Species } from '@prisma/client';
import { BreedResponse } from './dto/breed-response.dto';

@Injectable()
export class BreedService {
  constructor(private readonly prisma: PrismaService) {}

  async read(species?: Species) {
    const raws = await this.prisma.breed.findMany({
      where: {
        species,
      },
      orderBy: {
        name: 'asc',
      },
    });

    const breeds = raws.map((breed) => new BreedResponse(breed));
    return { breeds };
  }
}
