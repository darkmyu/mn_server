import { Public } from '@/auth/decorator/public.decorator';
import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get(':username')
  async read(@Param('username') username: string) {
    return this.userService.read(username);
  }

  @Public()
  @Get(':username/animals')
  async animals(@Param('username') username: string) {
    return this.userService.animals(username);
  }
}
