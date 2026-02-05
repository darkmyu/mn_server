import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum PhotoSort {
  POPULAR = 'POPULAR',
  LATEST = 'LATEST',
}

export class PhotoListQuery extends CursorPaginationQuery {
  @ApiPropertyOptional({
    enum: PhotoSort,
    default: PhotoSort.POPULAR,
  })
  @IsOptional()
  @IsEnum(PhotoSort)
  sort: PhotoSort = PhotoSort.POPULAR;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;
}
