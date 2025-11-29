import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class PhotoResponse {
  @ApiProperty()
  id: number;

  @ApiProperty()
  image: FileResponse;

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
  author: ProfileResponse;

  @ApiProperty()
  animal: AnimalResponse;

  constructor(
    photo: Prisma.PhotoGetPayload<{
      include: {
        user: true;
        image: true;
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
    this.title = photo.title;
    this.description = photo.description;
    this.tags = photo.tags.map(({ tag }) => new TagResponse(tag));
    this.author = new ProfileResponse(photo.user);
    this.animal = new AnimalResponse(photo.animal);

    if (photo.image) {
      this.image = new FileResponse(
        photo.image.path,
        photo.image.size,
        photo.image.width,
        photo.image.height,
        photo.image.mimetype,
      );
    }
  }
}
