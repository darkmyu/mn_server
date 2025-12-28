import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum PhotoSort {
  POPULAR = 'popular',
  LATEST = 'latest',
}

export class PhotoListQuery extends CursorPaginationQuery {
  @ApiPropertyOptional({
    enum: PhotoSort,
    default: PhotoSort.POPULAR,
  })
  @IsOptional()
  @IsEnum(PhotoSort)
  sort: PhotoSort = PhotoSort.POPULAR;
}
