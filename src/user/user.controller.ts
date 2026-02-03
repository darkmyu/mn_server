import { GetUser } from '@/auth/decorator/get-user.decorator';
import { Body, Controller, Delete, Param, Put } from '@nestjs/common';
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
  @Put(':id')
  async update(@Param('id') id: number, @GetUser() viewer: User, @Body() request: UserUpdateRequest) {
    return this.userService.update(id, viewer, request);
  }

  @ApiOkResponse({
    type: UserResponse,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() viewer: User) {
    return this.userService.delete(id, viewer);
  }
}
