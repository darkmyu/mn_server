import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { Public } from '@/auth/decorator/public.decorator';
import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { PaginationQuery } from '@/common/dto/pagination-query.dto';
import { PhotoResponse } from '@/photo/dto/photo-response.dto';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ProfileResponse } from './dto/profile-response.dto';
import { ProfileService } from './profile.service';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOkResponse({
    type: ProfileResponse,
  })
  @Public()
  @Get(':username')
  async read(@Param('username') username: string) {
    return this.profileService.read(username);
  }

  @ApiOkResponsePagination(AnimalResponse)
  @Public()
  @Get(':username/animals')
  async animals(@Param('username') username: string) {
    return this.profileService.animals(username);
  }

  @ApiOkResponsePagination(PhotoResponse)
  @Public()
  @Get(':username/photos')
  async photos(@Param('username') username: string, @Query() query: PaginationQuery) {
    return this.profileService.photos(username, query);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Public()
  @Get(':username/photos/:id')
  async photo(@Param('username') username: string, @Param('id') id: number) {
    return this.profileService.photo(username, id);
  }
}
