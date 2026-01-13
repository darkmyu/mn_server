import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { GetUser } from '@/auth/decorator/get-user.decorator';
import { IgnoreUnauthorized } from '@/auth/decorator/ignore-unauthorized.decorator';
import { Public } from '@/auth/decorator/public.decorator';
import { ApiOkResponseCursorPagination } from '@/common/decorator/api-ok-response-cursor-pagination.dto';
import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { PhotoResponse } from '@/photo/dto/photo-response.dto';
import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
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

  @ApiOkResponseCursorPagination(PhotoResponse)
  @IgnoreUnauthorized()
  @Get(':username/photos')
  async photos(
    @Param('username') username: string,
    @Query() query: CursorPaginationQuery,
    @GetUser() user: User | null,
  ) {
    return this.profileService.photos(username, query, user);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @IgnoreUnauthorized()
  @Get(':username/photos/:id')
  async photo(@Param('username') username: string, @Param('id') id: number, @GetUser() user: User | null) {
    return this.profileService.photo(username, id, user);
  }

  @ApiOkResponse()
  @Post(':username/follows')
  async follow(@Param('username') username: string, @GetUser() user: User) {
    return this.profileService.follow(username, user);
  }

  @ApiOkResponse()
  @Delete(':username/follows')
  async unfollow(@Param('username') username: string, @GetUser() user: User) {
    return this.profileService.unfollow(username, user);
  }
}
