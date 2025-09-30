import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Species } from '@prisma/client';
import { BreedService } from './breed.service';
import { BreedResponse } from './dto/breed-response.dto';

@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @ApiQuery({
    name: 'species',
    required: false,
    enum: Species,
  })
  @ApiOkResponsePagination(BreedResponse)
  @Get()
  async read(@Query('species') species?: Species) {
    return this.breedService.read(species);
  }
}
