import { GetUser } from '@/auth/decorator/get-user.decorator';
import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { PaginationQuery } from '@/common/dto/pagination-query.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
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

  @ApiOkResponsePagination(AnimalResponse)
  @Get()
  async all(@Query() query: PaginationQuery, @GetUser() viewer: User) {
    return this.animalService.all(query, viewer);
  }

  @ApiOkResponse({
    type: AnimalResponse,
  })
  @Get(':id')
  async read(@Param('id') id: number, @GetUser() viewer: User) {
    return this.animalService.read(id, viewer);
  }

  @ApiCreatedResponse({
    type: AnimalResponse,
  })
  @Post()
  async create(@GetUser() viewer: User, @Body() request: AnimalCreateRequest) {
    return this.animalService.create(viewer, request);
  }

  @ApiOkResponse({
    type: AnimalResponse,
  })
  @Put(':id')
  async update(@Param('id') id: number, @GetUser() viewer: User, @Body() request: AnimalUpdateRequest) {
    return this.animalService.update(id, viewer, request);
  }

  @ApiOkResponse({
    type: AnimalResponse,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() viewer: User) {
    return this.animalService.delete(id, viewer);
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
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|heic|heif|webp)/ }),
        ],
      }),
    )
    thumbnail: Express.Multer.File,
  ) {
    return this.animalService.upload(thumbnail);
  }
}
