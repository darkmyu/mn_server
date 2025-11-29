import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationQuery {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit: number = 10;
}
