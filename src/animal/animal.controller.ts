import { GetUser } from '@/auth/decorator/get-user.decorator';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { AnimalService } from './animal.service';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';
import { AnimalUpdateRequest } from './dto/animal-update-request.dto';

@Controller('animals')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  async create(@GetUser() user: User, @Body() request: AnimalCreateRequest) {
    return this.animalService.create(user, request);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @GetUser() user: User, @Body() request: AnimalUpdateRequest) {
    return this.animalService.update(id, user, request);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() user: User) {
    return this.animalService.delete(id, user);
  }

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
