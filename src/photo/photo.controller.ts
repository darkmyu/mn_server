import { GetUser } from '@/auth/decorator/get-user.decorator';
import { IgnoreUnauthorized } from '@/auth/decorator/ignore-unauthorized.decorator';
import { ApiOkResponseCursorPagination } from '@/common/decorator/api-ok-response-cursor-pagination.dto';
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
import { PhotoCommentCreateRequest } from './dto/photo-comment-create-request.dto';
import { PhotoCommentResponse } from './dto/photo-comment-response.dto';
import { PhotoCommentUpdateRequest } from './dto/photo-comment-update-request.dto';
import { PhotoCreateRequest } from './dto/photo-create-request.dto';
import { PhotoListQuery } from './dto/photo-list-query.dto';
import { PhotoResponse } from './dto/photo-response.dto';
import { PhotoUpdateRequest } from './dto/photo-update-request.dto';
import { PhotoService } from './photo.service';

@Controller('photos')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @ApiOkResponseCursorPagination(PhotoResponse)
  @IgnoreUnauthorized()
  @Get()
  async all(@Query() query: PhotoListQuery, @GetUser() user: User | null) {
    return this.photoService.all(query, user);
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

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() user: User) {
    return this.photoService.delete(id, user);
  }

  @ApiOkResponse()
  @Post(':id/likes')
  async like(@Param('id') id: number, @GetUser() user: User) {
    return this.photoService.like(id, user);
  }

  @ApiOkResponse()
  @Delete(':id/likes')
  async unlike(@Param('id') id: number, @GetUser() user: User) {
    return this.photoService.unlike(id, user);
  }

  @ApiCreatedResponse({
    type: PhotoCommentResponse,
  })
  @Post(':id/comments')
  async createComment(@Param('id') id: number, @GetUser() user: User, @Body() request: PhotoCommentCreateRequest) {
    return this.photoService.createComment(id, user, request);
  }

  @ApiOkResponse({
    type: PhotoCommentResponse,
  })
  @Put(':id/comments/:commentId')
  async updateComment(
    @Param('id') photoId: number,
    @Param('commentId') commentId: number,
    @GetUser() user: User,
    @Body() request: PhotoCommentUpdateRequest,
  ) {
    return this.photoService.updateComment(photoId, commentId, user, request);
  }

  @ApiOkResponse({
    type: PhotoCommentResponse,
  })
  @Delete(':id/comments/:commentId')
  async deleteComment(@Param('id') photoId: number, @Param('commentId') commentId: number, @GetUser() user: User) {
    return this.photoService.deleteComment(photoId, commentId, user);
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
