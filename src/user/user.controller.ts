import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { Public } from '@/auth/decorator/public.decorator';
import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { UserResponse } from './dto/user-response.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    type: UserResponse,
  })
  @Public()
  @Get(':username')
  async read(@Param('username') username: string) {
    return this.userService.read(username);
  }

  @ApiOkResponsePagination(AnimalResponse)
  @Public()
  @Get(':username/animals')
  async animals(@Param('username') username: string) {
    return this.userService.animals(username);
  }
}
