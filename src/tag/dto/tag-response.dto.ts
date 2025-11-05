import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@prisma/client';

export class TagResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  constructor(tag: Tag) {
    this.name = tag.name;
    this.slug = tag.slug;
  }
}
