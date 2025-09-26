import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Species } from '@prisma/client';
import { BreedService } from './breed.service';

@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @ApiQuery({
    name: 'species',
    required: false,
    enum: Species,
  })
  @Get()
  async read(@Query('species') species?: Species) {
    return this.breedService.read(species);
  }
}
