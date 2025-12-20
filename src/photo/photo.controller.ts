import { GetUser } from '@/auth/decorator/get-user.decorator';
import { Public } from '@/auth/decorator/public.decorator';
import { ApiOkResponsePagination } from '@/common/decorator/api-ok-response-pagination.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { CursorPagination } from '@/common/dto/cursor-pagination.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import {
  Body,
  Controller,
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
import { PhotoCreateRequest } from './dto/photo-create-request.dto';
import { PhotoResponse } from './dto/photo-response.dto';
import { PhotoUpdateRequest } from './dto/photo-update-request.dto';
import { PhotoService } from './photo.service';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @ApiOkResponsePagination(CursorPagination)
  @Public()
  @Get()
  async all(@Query() query: CursorPaginationQuery) {
    return this.photoService.all(query);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Get(':id')
  async read(@Param('id') id: number, @GetUser() user: User) {
    return this.photoService.read(id, user);
  }

  @ApiCreatedResponse({
    type: PhotoResponse,
  })
  @Post()
  async create(@GetUser() user: User, @Body() request: PhotoCreateRequest) {
    return this.photoService.create(user, request);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Put(':id')
  async update(@Param('id') id: number, @GetUser() user: User, @Body() request: PhotoUpdateRequest) {
    return this.photoService.update(id, user, request);
  }

  @ApiCreatedResponse({
    type: FileResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['image'],
    },
  })
  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 30 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|heic|heif|webp)/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.photoService.upload(image);
  }
}
