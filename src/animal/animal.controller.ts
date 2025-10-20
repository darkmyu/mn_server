import { GetUser } from '@/auth/decorator/get-user.decorator';
import { FileResponse } from '@/file/dto/file-response.dto';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AnimalService } from './animal.service';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';
import { AnimalResponse } from './dto/animal-response.dto';
import { AnimalUpdateRequest } from './dto/animal-update-request.dto';

@Controller('animals')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @ApiCreatedResponse({
    type: AnimalResponse,
  })
  @Post()
  async create(@GetUser() user: User, @Body() request: AnimalCreateRequest) {
    return this.animalService.create(user, request);
  }

  @ApiOkResponse({
    type: AnimalResponse,
  })
  @Put(':id')
  async update(@Param('id') id: number, @GetUser() user: User, @Body() request: AnimalUpdateRequest) {
    return this.animalService.update(id, user, request);
  }

  @ApiOkResponse({
    type: AnimalResponse,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() user: User) {
    return this.animalService.delete(id, user);
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
    },
  })
  @Post('thumbnail')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /image\/(png|jpeg|jpg|gif)/ }),
        ],
      }),
    )
    thumbnail: Express.Multer.File,
  ) {
    return this.animalService.upload(thumbnail);
  }
}
