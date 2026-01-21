import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import { ProfileResponse } from '@/profile/dto/profile-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export interface PhotoResponseParams {
  photo: Prisma.PhotoGetPayload<{
    include: {
      user: {
        include: {
          _count: {
            select: {
              followers: true;
              followings: true;
            };
          };
          followers: true;
        };
      };
      photoImage: true;
      photoAnimals: {
        include: {
          animal: {
            include: {
              user: true;
              breed: true;
            };
          };
        };
      };
      photoTags: {
        include: {
          tag: true;
        };
      };
      photoLikes: true;
    };
  }>;
  isOwner: boolean;
}

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

  @ApiProperty()
  likes: number;

  @ApiProperty()
  liked: boolean;

  @ApiProperty({
    isArray: true,
    type: TagResponse,
  })
  tags: TagResponse[];

  @ApiProperty({
    isArray: true,
    type: AnimalResponse,
  })
  animals: AnimalResponse[];

  @ApiProperty()
  author: ProfileResponse;

  constructor({ photo, isOwner }: PhotoResponseParams) {
    this.id = photo.id;
    this.title = photo.title;
    this.description = photo.description;
    this.likes = photo.likes;
    this.liked = photo.photoLikes.length > 0;
    this.tags = photo.photoTags.map(({ tag }) => new TagResponse({ tag }));
    this.animals = photo.photoAnimals.map(({ animal }) => new AnimalResponse({ animal }));
    this.author = new ProfileResponse({ user: photo.user, isOwner });

    if (photo.photoImage) {
      this.image = new FileResponse(
        photo.photoImage.path,
        photo.photoImage.size,
        photo.photoImage.width,
        photo.photoImage.height,
        photo.photoImage.mimetype,
      );
    }
  }
}
