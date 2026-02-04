import { GetUser } from '@/auth/decorator/get-user.decorator';
import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { UserResponse } from './dto/user-response.dto';
import { UserUpdateRequest } from './dto/user-update-request.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    type: UserResponse,
  })
  @Get()
  read(@GetUser() viewer: User) {
    return this.userService.read(viewer);
  }

  @ApiOkResponse({
    type: UserResponse,
  })
  @Put()
  async update(@GetUser() viewer: User, @Body() request: UserUpdateRequest) {
    return this.userService.update(viewer, request);
  }

  @ApiOkResponse({
    type: UserResponse,
  })
  @Delete()
  async delete(@GetUser() viewer: User) {
    return this.userService.delete(viewer);
  }
}
