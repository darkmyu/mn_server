import { GetUser } from '@/auth/decorator/get-user.decorator';
import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { AnimalService } from './animal.service';
import { AnimalCreateRequest } from './dto/animal-create-request.dto';

@Controller('animals')
export class AnimalController {
  constructor(private readonly animalService: AnimalService) {}

  @Post()
  async create(@GetUser() user: User, @Body() request: AnimalCreateRequest) {
    return this.animalService.create(user, request);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @GetUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: /image\/(png|jpeg|jpg|gif)/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.animalService.upload(user, image);
  }
}
