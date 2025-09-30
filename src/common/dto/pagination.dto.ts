import { ApiProperty } from '@nestjs/swagger';

export class Pagination<T> {
  @ApiProperty()
  items: T[];

  page: number;
  total: number;
  limit: number;
  isLast: boolean;

  constructor(items: T[], page: number, total: number, limit: number, isLast: boolean) {
    this.items = items;
    this.page = page;
    this.total = total;
    this.limit = limit;
    this.isLast = isLast;
  }
}
