import { CursorPaginationQuery } from '@/common/dto/cursor-pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Species } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class BreedListQuery extends CursorPaginationQuery {
  @ApiPropertyOptional({
    enum: Species,
  })
  @IsOptional()
  @IsEnum(Species)
  species?: Species;
}
