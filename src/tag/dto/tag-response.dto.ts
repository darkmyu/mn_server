import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '@prisma/client';

export interface TagResponseParams {
  tag: Tag;
}

export class TagResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  constructor({ tag }: TagResponseParams) {
    this.name = tag.name;
    this.slug = tag.slug;
  }
}
