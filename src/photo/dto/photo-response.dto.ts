import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { UserResponse } from '@/user/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class PhotoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  url: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    isArray: true,
    type: TagResponse,
  })
  tags: TagResponse[];

  @ApiProperty()
  user: UserResponse;

  @ApiProperty()
  animal: AnimalResponse;

  constructor(
    photo: Prisma.PhotoGetPayload<{
      include: {
        user: true;
        animal: {
          include: {
            user: true;
            breed: true;
          };
        };
        tags: {
          include: {
            tag: true;
          };
        };
      };
    }>,
  ) {
    this.id = photo.id;
    this.url = photo.url;
    this.title = photo.title;
    this.description = photo.description;
    this.tags = photo.tags.map(({ tag }) => new TagResponse(tag));
    this.user = new UserResponse(photo.user);
    this.animal = new AnimalResponse(photo.animal);
  }
}
