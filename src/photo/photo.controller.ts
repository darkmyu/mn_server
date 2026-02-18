import { GetUser } from '@/auth/decorator/get-user.decorator';
import { IgnoreUnauthorized } from '@/auth/decorator/ignore-unauthorized.decorator';
import { ApiOkResponseCursorPagination } from '@/common/decorator/api-ok-response-cursor-pagination.dto';
import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { MultiFileTypeValidator } from '@/common/validator/multi-file-type.validator';
import { FileResponse } from '@/file/dto/file-response.dto';
import {
  Body,
  Controller,
  Delete,
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
  async all(@Query() query: PhotoListQuery, @GetUser() viewer: User | null) {
    return this.photoService.all(query, viewer);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Get(':id')
  async read(@Param('id') id: number, @GetUser() viewer: User) {
    return this.photoService.read(id, viewer);
  }

  @ApiCreatedResponse({
    type: PhotoResponse,
  })
  @Post()
  async create(@GetUser() viewer: User, @Body() request: PhotoCreateRequest) {
    return this.photoService.create(viewer, request);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Put(':id')
  async update(@Param('id') id: number, @GetUser() viewer: User, @Body() request: PhotoUpdateRequest) {
    return this.photoService.update(id, viewer, request);
  }

  @ApiOkResponse({
    type: PhotoResponse,
  })
  @Delete(':id')
  async delete(@Param('id') id: number, @GetUser() viewer: User) {
    return this.photoService.delete(id, viewer);
  }

  @ApiOkResponse()
  @Post(':id/likes')
  async like(@Param('id') id: number, @GetUser() viewer: User) {
    return this.photoService.like(id, viewer);
  }

  @ApiOkResponse()
  @Delete(':id/likes')
  async unlike(@Param('id') id: number, @GetUser() viewer: User) {
    return this.photoService.unlike(id, viewer);
  }

  @ApiOkResponseCursorPagination(PhotoCommentResponse)
  @IgnoreUnauthorized()
  @Get(':id/comments')
  async getComments(@Param('id') id: number, @Query() query: CursorPaginationQuery, @GetUser() viewer: User | null) {
    return this.photoService.getComments(id, query, viewer);
  }

  @ApiOkResponseCursorPagination(PhotoCommentResponse)
  @IgnoreUnauthorized()
  @Get(':id/comments/:commentId/replies')
  async getReplies(
    @Param('id') id: number,
    @Param('commentId') commentId: number,
    @Query() query: CursorPaginationQuery,
    @GetUser() viewier: User | null,
  ) {
    return this.photoService.getReplies(id, commentId, query, viewier);
  }

  @ApiCreatedResponse({
    type: PhotoCommentResponse,
  })
  @Post(':id/comments')
  async createComment(@Param('id') id: number, @GetUser() viewer: User, @Body() request: PhotoCommentCreateRequest) {
    return this.photoService.createComment(id, viewer, request);
  }

  @ApiOkResponse({
    type: PhotoCommentResponse,
  })
  @Put(':id/comments/:commentId')
  async updateComment(
    @Param('id') photoId: number,
    @Param('commentId') commentId: number,
    @GetUser() viewer: User,
    @Body() request: PhotoCommentUpdateRequest,
  ) {
    return this.photoService.updateComment(photoId, commentId, viewer, request);
  }

  @ApiOkResponse({
    type: PhotoCommentResponse,
  })
  @Delete(':id/comments/:commentId')
  async deleteComment(@Param('id') photoId: number, @Param('commentId') commentId: number, @GetUser() viewer: User) {
    return this.photoService.deleteComment(photoId, commentId, viewer);
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
          new MultiFileTypeValidator({
            fileTypes: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
          }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.photoService.upload(image);
  }
}
