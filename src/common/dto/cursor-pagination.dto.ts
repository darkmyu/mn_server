import { ApiProperty } from '@nestjs/swagger';

export class CursorPagination<T> {
  items: T[];

  @ApiProperty({
    type: 'number',
    nullable: true,
  })
  cursor: number | null;

  @ApiProperty()
  total: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;

  constructor(items: T[], cursor: number | null, total: number, limit: number, hasNextPage: boolean) {
    this.items = items;
    this.cursor = cursor;
    this.total = total;
    this.limit = limit;
    this.hasNextPage = hasNextPage;
  }
}
