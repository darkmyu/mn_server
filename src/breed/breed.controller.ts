import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { BreedService } from './breed.service';
import { BreedListQuery } from './dto/breed-list-query.dto';
import { BreedResponse } from './dto/breed-response.dto';

@Controller('breeds')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @ApiOkResponsePagination(BreedResponse)
  @Get()
  async all(@Query() query: BreedListQuery) {
    return this.breedService.all(query);
  }
}
