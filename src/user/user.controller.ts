import { GetUser } from '@/auth/decorator/get-user.decorator';
import { MultiFileTypeValidator } from '@/common/validator/multi-file-type.validator';
import { FileResponse } from '@/file/dto/file-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
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

  @ApiCreatedResponse({
    type: FileResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['thumbnail'],
    },
  })
  @Post('thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async thumbnail(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }),
          new MultiFileTypeValidator({
            fileTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
          }),
        ],
      }),
    )
    thumbnail: Express.Multer.File,
  ) {
    return this.userService.thumbnail(thumbnail);
  }
}
