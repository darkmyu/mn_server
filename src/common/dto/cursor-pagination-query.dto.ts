import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CursorPaginationQuery {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  cursor?: number;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
