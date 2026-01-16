import { AnimalResponse } from '@/animal/dto/animal-response.dto';
import { FileResponse } from '@/file/dto/file-response.dto';
import { TagResponse } from '@/tag/dto/tag-response.dto';
import { UserResponse } from '@/user/dto/user-response.dto';
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

  @ApiProperty()
  likes: number;

  @ApiProperty()
  liked: boolean;

  @ApiProperty({
    isArray: true,
    type: TagResponse,
  })
  tags: TagResponse[];

  @ApiProperty()
  author: UserResponse;

  @ApiProperty({
    isArray: true,
    type: AnimalResponse,
  })
  animals: AnimalResponse[];

  constructor(
    photo: Prisma.PhotoGetPayload<{
      include: {
        user: true;
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
    }>,
  ) {
    this.id = photo.id;
    this.title = photo.title;
    this.description = photo.description;
    this.likes = photo.likes;
    this.liked = photo.photoLikes.length > 0;
    this.tags = photo.photoTags.map(({ tag }) => new TagResponse(tag));
    this.author = new UserResponse(photo.user);
    this.animals = photo.photoAnimals.map(({ animal }) => new AnimalResponse(animal));

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
